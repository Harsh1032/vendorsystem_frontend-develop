import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import FormDropdown from "../../ShareComponents/Forms/FormDropdown";
import * as Constants from "../../../constants";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { getAuthHeader } from "../../../helpers/Authorization";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import FileUploadInput from "../../ShareComponents/FileUploadInput";
import CardWidget from "../../ShareComponents/CardWidget";
import { sendPostRequest, sendGetRequests } from "../../../helpers/HttpRequestHelper";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import "../../../styles/dialogStyles.scss";
import "../../../styles/helpers/fileInput.scss";

const UploadDisposalFiles = ({
  asset,
  uploadDialogStatus,
  setUploadDialogStatus,
  setSelectedAsset,
  setAllRequests,
  selectedClient,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedPurposes, setSelectedPurposes] = useState([null]);
  const [files, setFiles] = useState([[]]);
  const [fileNames, setFileNames] = useState([[]]);

  const allPurposes = [
    "bill_of_sale",
    "insurance",
    "method_of_payment",
    "letter_of_release",
    "total_loss_declaration",
    "tax_receipt",
    "invoice_doc",
    "proceeds_file",
    "quote_file",
    "supporting_file",
  ];

  const cleanState = () => {
    setSelectedPurposes([null]);
    setFiles([[]]);
    setFileNames([[]]);
  };

  const handleUploadData = () => {
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "submit" });

    let newFiles = new FormData();

    let required_file_specs = { file_info: [] };
    for (let i = 0; i < selectedPurposes.length; i++) {
      required_file_specs.file_info.push({ file_name: fileNames[i], purpose: selectedPurposes[i] });
    }
    newFiles.append("file_specs", JSON.stringify(required_file_specs));

    const data = { custom_id: asset.custom_id };
    newFiles.append("data", JSON.stringify(data));

    files &&
      files.forEach((file) => {
        newFiles.append("files", file);
      });

    handleSubmit(newFiles);
  };

  const handleSubmit = (data) => {
    loadingAlert();
    const callback = () => {
      cleanState();
      setUploadDialogStatus(false);
      refreshData();
      successAlert();
    };
    const errorHandler = (error) => {
      ConsoleHelper(error);
      generalErrorAlert(error.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
    };

    const uploadFilesAPI = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetDisposal/Upload/Files`;

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
    const cancelTokenSource = axios.CancelToken.source();
    let selectedDisposal;

    const callback = (res) => {
      const validStatus = [
        "approved",
        "in transit - to vendor",
        "at vendor",
        "in progress",
        "complete",
      ];
      const disposals = res.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));
      selectedDisposal = disposals.filter((disposal) => disposal.custom_id === asset.custom_id)[0];
      setSelectedAsset(selectedDisposal);
      setAllRequests(disposals);
      successAlert("msg", t("removalDetails.upload_files_success"));
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
          disabled={selectedPurposes.includes(null) || files.some((file) => file.length === 0)}
          autoFocus
        />
      </div>
    );
  };

  const setPurposesInArray = (index) => (purpose) => {
    const purposesCopy = [...selectedPurposes];
    purposesCopy.splice(index, 1, purpose);
    setSelectedPurposes(purposesCopy);
  };
  const setFilesInArray = (index) => (file) => {
    const filesCopy = [...files];
    filesCopy.splice(index, 1, file);
    setFiles(filesCopy);
  };
  const setFileNamesInArray = (index) => (fileName) => {
    const fileNamesCopy = [...fileNames];
    fileNamesCopy.splice(index, 1, fileName);
    setFileNames(fileNamesCopy);
  };

  const addFileGroup = () => {
    setSelectedPurposes([...selectedPurposes, null]);
    setFiles([...files, []]);
    setFileNames([...fileNames, []]);
  };
  const deleteFileGroup = (index) => () => {
    const purposesCopy = [...selectedPurposes];
    purposesCopy.splice(index, 1);
    setSelectedPurposes(purposesCopy);
    const filesCopy = [...files];
    filesCopy.splice(index, 1);
    setFiles(filesCopy);
    const fileNamesCopy = [...fileNames];
    fileNamesCopy.splice(index, 1);
    setFileNames(fileNamesCopy);
  };

  return (
    <Dialog
      className="custom-main-dialog"
      header={t("removalDetails.upload_disposal_header")}
      visible={uploadDialogStatus}
      onHide={() => {
        cleanState();
        setUploadDialogStatus(false);
      }}
      style={{ width: "50vw" }}
      breakpoints={{ "1440px": "75vw", "980px": "85vw", "600px": "90vw" }}
      footer={renderFooter}
    >
      {selectedPurposes.map((purpose, index) => (
        <CardWidget key={index} status={files[index].length !== 0 ? true : undefined}>
          <div>
            <FormDropdown
              onChange={setPurposesInArray(index)}
              options={allPurposes.map((el) => ({
                name: t(`fileUploadInput.add_${el}`).replace("Add ", "").replace(" File", ""),
                code: el,
              }))}
              placeholder={t("fileUploadInput.choose_purpose")}
              plain_dropdown
              leftStatus
              reset
            />
            {selectedPurposes[index] ? (
              <div className="p-field">
                <label>{t(`fileUploadInput.add_${purpose}`)}</label>
                <div className="custom-file input-files-container">
                  <FileUploadInput
                    images={files[index]}
                    setImages={setFilesInArray(index)}
                    imageNames={fileNames[index]}
                    setImageNames={setFileNamesInArray(index)}
                    fileTypes=".pdf,.doc,.docx"
                    noPrevState
                  />
                </div>
              </div>
            ) : (
              <p>Please select the purpose for the file.</p>
            )}
          </div>
          {index > 0 && (
            <span>
              <Button
                className="p-button-danger p-button-bold mt-3"
                label={t("fileUploadInput.delete_file_group")}
                icon="pi pi-times"
                onClick={deleteFileGroup(index)}
              />
            </span>
          )}
        </CardWidget>
      ))}
      <Button
        className="p-button-bold"
        label={t("fileUploadInput.add_file_group")}
        icon="pi pi-plus"
        onClick={addFileGroup}
        disabled={selectedPurposes.includes(null) || allPurposes.length === 0}
        autoFocus
      />
    </Dialog>
  );
};

export default UploadDisposalFiles;
