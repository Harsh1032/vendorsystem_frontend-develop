import React, { useEffect, useState, useMemo } from "react";
import moment from "moment";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getAuthHeader } from "../../../helpers/Authorization";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import DatePicker from "../../ShareComponents/DatePicker";
import GeneralRadio from "../../ShareComponents/GeneralRadio";
import FormDropdown from "../../ShareComponents/Forms/FormDropdown";
import FileUploadInput from "../../ShareComponents/FileUploadInput";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import { sendPostRequest, sendGetRequests } from "../../../helpers/HttpRequestHelper";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import * as Constants from "../../../constants";

function AssetRequestStatusUpdate({
  order,
  selectedClient,
  setAllRequests,
  updateDialogStatus,
  setUpdateDialogStatus,
  setSelectedOrder,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [defaultStatus, setDefaultStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [reset, setReset] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoicesNames, setInvoicesNames] = useState([]);
  const [isFillout, setIsFillout] = useState(false);

  const statusOptions = useMemo(() => {
    if (order.status === "ordered") {
      return [
        {
          name: t("requestProgress.built"),
          code: "built",
        },
        {
          name: t("requestProgress.in_transit_to_client"),
          code: "in transit - to client",
        },
      ];
    } else {
      return [
        {
          name: t("requestProgress.in_transit_to_client"),
          code: "in transit - to client",
        },
      ];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.status]);

  useEffect(() => {
    if (selectedStatus && selectedStatus === "in transit - to client") {
      if (order.vendor_transport_to_client) {
        if (deliveryDate) {
          setIsFillout(true);
        } else {
          setIsFillout(false);
        }
      } else {
        setIsFillout(true);
      }
    } else if (selectedStatus) {
      setIsFillout(true);
    } else setIsFillout(false);
  }, [order, deliveryDate, selectedStatus]);

  useEffect(() => {
    if (reset && order) {
      let nextStep;
      if (order.status === "ordered") {
        nextStep = "built";
      } else if (order.status === "built") {
        nextStep = "in transit - to client";
      }
      const dstatus = statusOptions.filter((op) => op.code === nextStep)[0];
      setDefaultStatus(dstatus);
      setSelectedStatus(dstatus?.code);
      setReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, reset]);

  const renderFooter = () => {
    return (
      <Button
        label={t("general.update")}
        icon="pi pi-check"
        className="p-button-success p-mt-4"
        onClick={() => {
          handleStatusUpdate();
        }}
        disabled={!isFillout}
      />
    );
  };

  const handleStatusUpdate = () => {
    const cancelTokenSource = axios.CancelToken.source();
    loadingAlert();

    const data = {
      custom_id: order.custom_id,
      status: selectedStatus,
      date: moment(new Date()).toISOString(),
      ...(selectedStatus === "in transit - to client" &&
        order.vendor_transport_to_client && {
          estimated_delivery_date: moment(deliveryDate).toISOString(),
        }),
    };

    let newFiles = new FormData();
    let required_file_specs = {
      file_info: [],
    };

    if (invoices.length > 0) {
      for (let i = 0; i < invoices.length; i++) {
        required_file_specs.file_info.push({ file_name: invoices[i].name, purpose: "invoice" });
        newFiles.append("files", invoices[i]);
      }
    }
    newFiles.append("file_specs", JSON.stringify(required_file_specs));

    newFiles.append("data", JSON.stringify(data));

    const callback = () => {
      setDeliveryDate(null);
      setUpdateDialogStatus(false);
      refreshData(data);
    };
    const errorHandler = (err) => {
      generalErrorAlert(err.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
      ConsoleHelper(err);
    };

    sendPostRequest(
      `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetRequest/UpdateStatus`,
      newFiles,
      {
        ...getAuthHeader(),
        cancelToken: cancelTokenSource.token,
      },
      callback,
      errorHandler
    );
  };

  const refreshData = (data) => {
    const cancelTokenSource = axios.CancelToken.source();
    const requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetRequest/Get/${selectedClient}`;

    const callback = (result) => {
      let targetOrder = null;
      const validStatus = ["approved", "ordered", "built", "in transit - to client", "delivered"];
      const allRequests = result.data.filter((el) =>
        validStatus.includes(el.status?.toLowerCase())
      );
      for (let i in allRequests) {
        if (allRequests[i].custom_id === order.custom_id) {
          targetOrder = allRequests[i];
        }
      }

      setAllRequests(allRequests);
      setSelectedOrder(targetOrder);
      setReset(true);
      successAlert("msg", t("assetRequest.success_update_status"));
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "success_alert" });
    };

    const errorHandler = (err) => {
      ConsoleHelper(err);
    };

    sendGetRequests(
      [requestURL],
      {
        ...getAuthHeader(),
        cancelToken: cancelTokenSource.token,
      },
      [callback],
      errorHandler
    );
  };

  const selectStatus = (status) => {
    setSelectedStatus(status);
  };

  const onHide = () => {
    setDeliveryDate(null);
    setUpdateDialogStatus(false);
    setReset(true);
  };

  return (
    <Dialog
      className="custom-main-dialog"
      header={t("assetRequest.update_asset_request_status")}
      visible={updateDialogStatus}
      footer={renderFooter}
      onHide={onHide}
      style={{ width: "30vw" }}
      breakpoints={{ "1280px": "40vw", "960px": "60vw", "768px": "80vw" }}
    >
      <div className="p-field">
        <label>{t("general.update_status")}</label>
        <FormDropdown
          defaultValue={defaultStatus}
          className="w-100"
          onChange={selectStatus}
          options={statusOptions}
          dataReady={statusOptions.length !== 0 ? true : false}
          plain_dropdown
          leftStatus
          reset={"disabled"}
        />
      </div>
      {order.vendor_transport_to_client && selectedStatus === "in transit - to client" && (
        <React.Fragment>
          <div className="p-field">
            <label>{t("general.estimated_delivery_date")}</label>
            <div className="p-fluid p-grid p-formgrid">
              <div className="p-col-12">
                <DatePicker
                  onChange={setDeliveryDate}
                  initialDate={deliveryDate}
                  minDate={new Date()}
                  leftStatus
                />
              </div>
            </div>
          </div>
          <div className="p-field">
            <label>{t("fileUploadInput.add_invoice_doc")}</label>
            <div className="custom-file input-files-container">
              <FileUploadInput
                images={invoices}
                setImages={setInvoices}
                imageNames={invoicesNames}
                setImageNames={setInvoicesNames}
                fileTypes=".pdf,.doc,.docx"
                maxNumberOfFiles={10}
              />
            </div>
          </div>
        </React.Fragment>
      )}
    </Dialog>
  );
}

export default AssetRequestStatusUpdate;
