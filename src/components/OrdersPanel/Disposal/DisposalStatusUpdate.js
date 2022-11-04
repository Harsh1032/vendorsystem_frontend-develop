import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import * as Constants from "../../../constants";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendPostRequest, sendGetRequests } from "../../../helpers/HttpRequestHelper";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import FormDropdown from "../../ShareComponents/Forms/FormDropdown";
// import FileUploadInput from "../../ShareComponents/FileUploadInput";
import { successAlert, loadingAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import "../../../styles/dialogStyles.scss";

const DisposalStatusUpdate = ({
  asset,
  completeDialogStatus,
  setCompleteDialogStatus,
  setSelectedAsset,
  setAllRequests,
  selectedClient,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [defaultStatus, setDefaultStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [reset, setReset] = useState(true);
  // const [invoices, setInvoices] = useState([]);
  // const [invoicesNames, setInvoicesNames] = useState([]);

  const statusOptions =
    asset.status === "in transit - to vendor"
      ? [
          {
            name: t("requestProgress.at_vendor"),
            code: "at vendor",
          },
          {
            name: t("requestProgress.in_progress"),
            code: "in progress",
          },
        ]
      : asset.status === "at vendor"
      ? [
          {
            name: t("requestProgress.in_progress"),
            code: "in progress",
          },
        ]
      : [];

  useEffect(() => {
    if (reset && asset) {
      let nextStep;
      if (asset.status === "in transit - to vendor") {
        nextStep = "at vendor";
      } else if (asset.status === "at vendor") {
        nextStep = "in progress";
      }
      const dstatus = statusOptions.filter((op) => op.code === nextStep)[0];
      setDefaultStatus(dstatus);
      setSelectedStatus(dstatus?.code);
      setReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, reset]);

  const handleDisposalComplete = () => {
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "submit" });

    let updateData;

    updateData = {
      custom_id: asset.custom_id,
      disposal_type: asset.disposal_type.toLowerCase(),
      status: selectedStatus,
    };

    let newFiles = new FormData();
    let required_file_specs = {
      file_info: [],
    };

    // if (invoices.length > 0) {
    //   for (let i = 0; i < invoices.length; i++) {
    //     required_file_specs.file_info.push({ file_name: invoices[i].name, purpose: "invoice" });
    //     newFiles.append("files", invoices[i]);
    //   }
    // }
    newFiles.append("file_specs", JSON.stringify(required_file_specs));

    newFiles.append("data", JSON.stringify(updateData));

    handleSubmit(newFiles);
  };

  const handleSubmit = async (data) => {
    loadingAlert();

    const callback = () => {
      setCompleteDialogStatus(false);
      refreshData(data);
    };
    const errorHandler = (err) => {
      generalErrorAlert(err.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
      ConsoleHelper(err);
    };
    sendPostRequest(
      `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetDisposal/UpdateStatus`,
      data,
      getAuthHeader(),
      callback,
      errorHandler
    );
  };

  const refreshData = (data) => {
    const cancelTokenSource = axios.CancelToken.source();

    const callback = (res) => {
      let selectedDisposal = null;
      const validStatus = [
        "approved",
        "in transit - to vendor",
        "at vendor",
        "in progress",
        "complete",
      ];
      const disposals = res.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));

      for (let i in disposals) {
        if (disposals[i].custom_id === data.custom_id) {
          selectedDisposal = disposals[i];
        }
      }

      setSelectedAsset(selectedDisposal);
      setAllRequests(disposals);
      setReset(true);
      successAlert("msg", t("removalDetails.success_update_status"));
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "success_alert" });
    };
    const requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetDisposal/Get/${selectedClient}`;
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
    setSelectedStatus(status);
  };

  const onHide = () => {
    setCompleteDialogStatus(false);
    setReset(true);
  };

  const renderFooter = () => {
    return (
      <Button
        label={t("general.update")}
        icon="pi pi-check"
        className="p-button-success p-mt-4"
        // disabled={selectedStatus === "complete" && invoices.length === 0}
        onClick={() => {
          handleDisposalComplete();
        }}
      />
    );
  };

  return (
    <div>
      <Dialog
        className="custom-main-dialog"
        header={t("removalIssueDetails.dialog_title")}
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
        {/* TODO MIGHT UPLOAD REQUIRED FILES WHEN SET STATUS TO IN PROGRESS/COMPLETE */}

        {/* {selectedStatus === "complete" && (
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
        )}  */}
      </Dialog>
    </div>
  );
};

export default DisposalStatusUpdate;
