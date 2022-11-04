import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import * as Constants from "../../../constants";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { getAuthHeader } from "../../../helpers/Authorization";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import FileUploadInput from "../../ShareComponents/FileUploadInput";
import { sendPostRequest, sendGetRequests } from "../../../helpers/HttpRequestHelper";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import "../../../styles/dialogStyles.scss";
import "../../../styles/helpers/fileInput.scss";

const UploadMaintenanceFiles = ({
  maintenance,
  uploadDialogStatus,
  setUploadDialogStatus,
  setSelectedMaintenance,
  setAllRequests,
  selectedClient,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoicesNames, setInvoicesNames] = useState([]);

  const handleUploadData = () => {
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "submit" });
    let newFiles = new FormData();

    const data = { work_order: maintenance.work_order };

    let required_file_specs = {
      file_info: [],
    };
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        required_file_specs.file_info.push({ file_name: files[i].name, purpose: "other" });
        newFiles.append("files", files[i]);
      }
    }
    if (invoices.length > 0) {
      for (let i = 0; i < invoices.length; i++) {
        required_file_specs.file_info.push({ file_name: invoices[i].name, purpose: "invoice" });
        newFiles.append("files", invoices[i]);
      }
    }

    newFiles.append("file_specs", JSON.stringify(required_file_specs));
    newFiles.append("data", JSON.stringify(data));

    handleSubmit(newFiles);
  };

  const handleSubmit = (data) => {
    loadingAlert();
    const callback = () => {
      setUploadDialogStatus(false);
      refreshData();
      successAlert();
    };
    const errorHandler = (error) => {
      ConsoleHelper(error);
      generalErrorAlert(error.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
    };

    const uploadFilesAPI = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Maintenance/Upload/Files`;

    sendPostRequest(
      uploadFilesAPI,
      data,
      {
        ...getAuthHeader(),
      },
      callback,
      errorHandler
    );
  };

  const refreshData = async () => {
    // reset fields
    setFiles([]);
    setFileNames([]);
    setInvoices([]);
    setInvoicesNames([]);

    const cancelTokenSource = axios.CancelToken.source();
    let selectedMaintenance;

    const callback = (res) => {
      const validStatus = [
        "approved",
        "in transit - to vendor",
        "in transit - to client",
        "at vendor",
        "complete",
        "delivered",
      ];
      const maintenances = res.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));

      for (let i in maintenances) {
        if (maintenances[i].maintenance_id === maintenance.maintenance_id) {
          selectedMaintenance = maintenances[i];
        }
      }
      setSelectedMaintenance(selectedMaintenance);
      setAllRequests(maintenances);
      successAlert("msg", t("maintenanceDetails.upload_files_success"));
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "success_alert" });
    };
    const requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Maintenance/Get/${selectedClient}`;
    sendGetRequests(
      [requestURL],
      {
        ...getAuthHeader(),
        cancelToken: cancelTokenSource.token,
      },
      [callback]
    );
  };

  const renderFooter = () => {
    return (
      <div>
        <Button
          label={t("general.cancel")}
          icon="pi pi-times"
          onClick={() => setUploadDialogStatus(false)}
          className="p-button-text"
        />
        <Button
          label={t("general.submit")}
          icon="pi pi-check"
          onClick={handleUploadData}
          disabled={files.length === 0 && invoices.length === 0}
          autoFocus
        />
      </div>
    );
  };

  return (
    <Dialog
      className="custom-main-dialog"
      header={t("maintenanceDetails.upload_maintenance_header")}
      visible={uploadDialogStatus}
      onHide={() => setUploadDialogStatus(false)}
      style={{ width: "50vw" }}
      breakpoints={{ "1440px": "75vw", "980px": "85vw", "600px": "90vw" }}
      footer={renderFooter}
    >
      <div className="p-field">
        <label>{t("fileUploadInput.add_supporting_file")}</label>
        <div className="custom-file input-files-container">
          <FileUploadInput
            images={files}
            setImages={setFiles}
            imageNames={fileNames}
            setImageNames={setFileNames}
            fileTypes=".pdf,.doc,.docx"
            maxNumberOfFiles={10}
          />
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
    </Dialog>
  );
};

export default UploadMaintenanceFiles;
