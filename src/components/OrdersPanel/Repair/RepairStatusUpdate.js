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
import FileUploadInput from "../../ShareComponents/FileUploadInput";
import FormDropdown from "../../ShareComponents/Forms/FormDropdown";
import BatchCostsForm from "../../ShareComponents/BatchCostsForm";
import { successAlert, loadingAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import "../../../styles/dialogStyles.scss";

const RepairStatusUpdate = ({
  repair,
  completeDialogStatus,
  setCompleteDialogStatus,
  setSelectedRepair,
  setAllRequests,
  selectedClient,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.apiCallData);
  const currencies = userInfo.aux_data.currencies;
  const [repairCompleteDate, setRepairCompleteDate] = useState(new Date());
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
    if (repair.status === "in transit - to vendor") {
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
    } else if (repair.status === "at vendor") {
      options = [
        {
          name: t("requestProgress.complete"),
          code: "complete",
        },
      ];
    } else if (repair.status === "complete") {
      options = [
        {
          name: t("requestProgress.in_transit_to_client"),
          code: "in transit - to client",
        },
      ];
    }

    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repair]);

  useEffect(() => {
    if (selectedStatus && selectedStatus === "complete") {
      if (repairCompleteDate) {
        setIsFillout(true);
      } else {
        setIsFillout(false);
      }
    } else if (selectedStatus === "in transit - to client") {
      if (repair.vendor_transport_to_client) {
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
  }, [repair, deliveryDate, repairCompleteDate, selectedStatus]);

  useEffect(() => {
    if (repair.status === "at vendor" && completeDialogStatus) {
      setInvoiceDialogStatus(true);
    }
  }, [repair.status, completeDialogStatus]);

  useEffect(() => {
    if (reset && repair) {
      let nextStep;
      if (repair.status === "in transit - to vendor") {
        nextStep = "at vendor";
      } else if (repair.status === "at vendor") {
        nextStep = "complete";
      } else if (repair.status === "complete") {
        nextStep = "in transit - to client";
      }
      const dstatus = statusOptions.filter((op) => op.code === nextStep)[0];

      setDefaultStatus(dstatus);
      setSelectedStatus(dstatus?.code);
      setReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repair, reset]);

  const handleRepairComplete = () => {
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "submit" });
    let updateData;

    updateData = {
      status_data: {
        work_order: repair.work_order,
        status: selectedStatus,
        ...(selectedStatus === "at vendor" && {
          date: moment(new Date()).toISOString(),
        }),
        ...(selectedStatus === "complete" && {
          date_completed: moment(repairCompleteDate).toISOString(),
        }),
        ...(selectedStatus === "in transit - to client" &&
          repair.vendor_transport_to_client && {
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
      setRepairCompleteDate(new Date());
      setCompleteDialogStatus(false);
      refreshData(newFiles);
    };
    const errorHandler = (err) => {
      generalErrorAlert(err.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
      ConsoleHelper(err);
    };
    sendPostRequest(
      `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Repair/UpdateStatus`,
      newFiles,
      getAuthHeader(),
      callback,
      errorHandler
    );
  };

  const refreshData = (newFiles) => {
    const cancelTokenSource = axios.CancelToken.source();

    const callback = (res) => {
      let selectedRepair = null;
      const validStatus = [
        "approved",
        "in transit - to vendor",
        "in transit - to client",
        "at vendor",
        "complete",
        "delivered",
      ];
      const repairs = res.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));
      const data = JSON.parse(newFiles.get("data"))["status_data"];
      for (let i in repairs) {
        if (repairs[i].work_order === data.work_order) {
          selectedRepair = repairs[i];
        }
      }
      setSelectedRepair(selectedRepair);
      setAllRequests(repairs);
      setReset(true);
      successAlert("msg", t("repairDetails.success_update_status"));
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "success_alert" });
    };
    const requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Repair/Get/${selectedClient}`;
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
    setCompleteDialogStatus(false);
    setLaborCosts([]);
    setPartsCosts([]);
    setRepairCompleteDate(new Date());
    setDeliveryDate(null);
    setReset(true);
  };

  const renderFooter = () => {
    return (
      <Button
        label={t("general.update")}
        icon="pi pi-check"
        className="p-button-success p-mt-4"
        onClick={() => {
          handleRepairComplete();
        }}
        disabled={!isFillout}
      />
    );
  };

  return (
    <div>
      <Dialog
        className="custom-main-dialog"
        header={t("repairIssueDetails.dialog_title")}
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
        {(repair.status === "at vendor" || selectedStatus === "complete") && (
          <div>
            <div className="p-field">
              <div className="p-mb-3">{t("repairIssueDetails.dialog_text")}</div>
              <DatePicker
                onChange={setRepairCompleteDate}
                initialDate={repairCompleteDate}
                maxDate={new Date()}
                leftStatus
              />
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
          </div>
        )}
        {repair.vendor_transport_to_client &&
          (repair.status === "complete" || selectedStatus === "in transit - to client") && (
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
          )}
      </Dialog>
      {repair.issues.length > 0 && (
        <BatchCostsForm
          laborCosts={laborCosts}
          setLaborCosts={setLaborCosts}
          partsCosts={partsCosts}
          setPartsCosts={setPartsCosts}
          dialogStatus={invoiceDialogStatus}
          setDialogStatus={setInvoiceDialogStatus}
          issues={repair.issues}
          currencies={currencies}
          onClose={() => {
            onHide();
          }}
        />
      )}
      )
    </div>
  );
};

export default RepairStatusUpdate;
