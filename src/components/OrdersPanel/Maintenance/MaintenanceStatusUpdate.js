import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import * as Constants from "../../../constants";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendPostRequest, sendGetRequests } from "../../../helpers/HttpRequestHelper";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import DatePicker from "../../ShareComponents/DatePicker";
import GeneralRadio from "../../ShareComponents/GeneralRadio";
import FormDropdown from "../../ShareComponents/Forms/FormDropdown";
import FileUploadInput from "../../ShareComponents/FileUploadInput";
import BatchCostsForm from "../../ShareComponents/BatchCostsForm";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import "../../../styles/dialogStyles.scss";

const MaintenanceStatusUpdate = ({
  maintenance,
  completeDialogStatus,
  setCompleteDialogStatus,
  setSelectedMaintenance,
  setAllRequests,
  selectedClient,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.apiCallData);
  const currencies = userInfo.aux_data.currencies;
  const [defaultStatus, setDefaultStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [reset, setReset] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [invoicesNames, setInvoicesNames] = useState([]);
  const [invoiceDialogStatus, setInvoiceDialogStatus] = useState(false);
  const [laborCosts, setLaborCosts] = useState([]);
  const [partsCosts, setPartsCosts] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [isFillout, setIsFillout] = useState(false);

  const statusOptions = useMemo(() => {
    let options = [];
    if (maintenance.status === "in transit - to vendor") {
      options = [
        {
          name: t("requestProgress.at_vendor"),
          code: "at vendor",
        },
        {
          name: t("requestProgress.complete"),
          code: "complete",
        },
      ];
    } else if (maintenance.status === "at vendor") {
      options = [
        {
          name: t("requestProgress.complete"),
          code: "complete",
        },
      ];
    } else if (maintenance.status === "complete") {
      options = [
        {
          name: t("requestProgress.in_transit_to_client"),
          code: "in transit - to client",
        },
      ];
    }

    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenance]);

  useEffect(() => {
    if (selectedStatus && selectedStatus === "in transit - to client") {
      if (maintenance.vendor_transport_to_client) {
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
    } else {
      setIsFillout(false);
    }
  }, [maintenance, deliveryDate, selectedStatus]);

  useEffect(() => {
    if (maintenance.status === "at vendor" && completeDialogStatus) {
      setInvoiceDialogStatus(true);
    }
  }, [maintenance.status, completeDialogStatus]);

  useEffect(() => {
    if (reset && maintenance) {
      let nextStep;
      if (maintenance.status === "in transit - to vendor") {
        nextStep = "at vendor";
      } else if (maintenance.status === "at vendor") {
        nextStep = "complete";
      } else if (maintenance.status === "complete") {
        nextStep = "in transit - to client";
      }
      const dstatus = statusOptions.filter((op) => op.code === nextStep)[0];
      setDefaultStatus(dstatus);
      setSelectedStatus(dstatus?.code);
      setReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenance, reset]);

  const handleMaintenanceComplete = () => {
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "submit" });

    const updateData = {
      status_data: {
        work_order: maintenance.work_order,
        status: selectedStatus,
        ...(selectedStatus === "in transit - to client" &&
          maintenance.vendor_transport_to_client && {
            estimated_delivery_date: moment(deliveryDate).toISOString(),
          }),
      },
      labor_costs: laborCosts,
      parts_costs: partsCosts,
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

    newFiles.append("data", JSON.stringify(updateData));

    handleSubmit(newFiles);
  };

  const handleSubmit = async (newFiles) => {
    loadingAlert();

    const callback = () => {
      setLaborCosts([]);
      setPartsCosts([]);
      setDeliveryDate(null);
      setCompleteDialogStatus(false);
      refreshData(newFiles);
    };
    const errorHandler = (err) => {
      generalErrorAlert(err.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
      ConsoleHelper(err);
    };

    sendPostRequest(
      `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Maintenance/UpdateStatus`,
      newFiles,
      getAuthHeader(),
      callback,
      errorHandler
    );
  };

  const refreshData = (newFiles) => {
    const cancelTokenSource = axios.CancelToken.source();

    const requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Maintenance/Get/${selectedClient}`;
    const callback = (res) => {
      let selectedMaintenance = null;
      const validStatus = [
        "approved",
        "in transit - to vendor",
        "in transit - to client",
        "at vendor",
        "complete",
        "delivered",
      ];
      const allMaintenances = res.data.filter((el) =>
        validStatus.includes(el.status?.toLowerCase())
      );
      const data = JSON.parse(newFiles.get("data"))["status_data"];
      for (let i in allMaintenances) {
        if (allMaintenances[i].work_order === data.work_order) {
          selectedMaintenance = allMaintenances[i];
        }
      }
      setSelectedMaintenance(selectedMaintenance);
      setAllRequests(allMaintenances);
      setReset(true);
      successAlert("msg", t("maintenanceDetails.success_update_status"));
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "success_alert" });
    };

    sendGetRequests(
      [requestURL],
      {
        ...getAuthHeader(),
        cancelToken: cancelTokenSource.token,
      },
      [callback]
    );
  };

  const selectStatus = (status) => {
    if (status === "complete") {
      setInvoiceDialogStatus(true);
    } else {
      setLaborCosts([]);
      setPartsCosts([]);
    }
    setSelectedStatus(status);
  };

  const onHide = () => {
    setLaborCosts([]);
    setPartsCosts([]);
    setDeliveryDate(null);
    setCompleteDialogStatus(false);
    setReset(true);
  };

  const renderFooter = () => {
    return (
      <Button
        label={t("general.update")}
        icon="pi pi-check"
        className="p-button-success p-mt-4"
        onClick={() => {
          handleMaintenanceComplete();
        }}
        disabled={!isFillout}
      />
    );
  };

  return (
    <>
      <Dialog
        className="custom-main-dialog"
        header={t("maintenanceDetails.update_maintenance_status")}
        visible={completeDialogStatus}
        footer={renderFooter}
        onHide={onHide}
        style={{ width: "40vw" }}
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
            reset="disabled"
          />
        </div>
        {selectedStatus === "complete" && (
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
        )}
        {maintenance.vendor_transport_to_client &&
        (maintenance.status === "complete" || selectedStatus === "in trnasit - to client") ? (
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
        ) : null}
      </Dialog>
      <BatchCostsForm
        laborCosts={laborCosts}
        setLaborCosts={setLaborCosts}
        partsCosts={partsCosts}
        setPartsCosts={setPartsCosts}
        dialogStatus={invoiceDialogStatus}
        setDialogStatus={setInvoiceDialogStatus}
        maintenanceID={maintenance.maintenance_id}
        currencies={currencies}
        onClose={() => {
          onHide();
        }}
      />
    </>
  );
};

export default MaintenanceStatusUpdate;
