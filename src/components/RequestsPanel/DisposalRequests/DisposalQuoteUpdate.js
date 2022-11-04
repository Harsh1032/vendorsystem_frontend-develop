import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import * as Constants from "../../../constants";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendGetRequests, sendPostRequest } from "../../../helpers/HttpRequestHelper";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import CustomInputNumber from "../../ShareComponents/CustomInputNumber";
import FileUploadInput from "../../ShareComponents/FileUploadInput";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import "../../../styles/dialogStyles.scss";
import "../../../styles/helpers/fileInput.scss";

const DisposalQuoteUpdate = ({
  asset,
  editDialogStatus,
  setEditDialogStatus,
  quote,
  setDataReady,
  selectedClient,
  setAllRequests,
  setSelectedAsset,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [cost, setCost] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);

  useEffect(() => {
    if (quote && quote.modified_by) {
      setCost(quote.estimated_cost);
    }
  }, [quote]);

  const handleQuoteUpdate = () => {
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "submit" });
    const formData = {
      estimated_cost: cost,
    };
    /*  FILE OPTION BELOW */
    let quoteRequest = new FormData();
    quoteRequest.append(
      "data",
      JSON.stringify({
        request_custom_id: asset.custom_id,
        status: "sent",
      })
    );
    let required_file_specs = {
      file_info: [],
    };
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        required_file_specs.file_info.push({ file_name: files[i].name, purpose: "quote" });
        quoteRequest.append("files", files[i]);
      }
      quoteRequest.append("file_specs", JSON.stringify(required_file_specs));
    }
    /*  FILE OPTION ABOVE */
    const quoteData = quote
      ? {
          asset_disposal_quote_id: quote.asset_disposal_quote_id,
          ...formData,
        }
      : {
          client_request_custom_id: asset.custom_id,
          ...formData,
        };

    handleUpdateSubmit(quoteData, quoteRequest);
  };

  const hideDialog = () => {
    setEditDialogStatus(false);
    setFiles([]);
    setFileNames([]);
    if (quote && quote.modified_by) {
      setCost(quote.estimated_cost);
    } else {
      setCost(null);
    }
  };

  const handleUpdateSubmit = (quoteData, quoteRequest) => {
    loadingAlert();

    const quoteDataUrl = quote
      ? `${Constants.ENDPOINT_PREFIX}/api/v1/AssetDisposal/Update/Quote`
      : `${Constants.ENDPOINT_PREFIX}/api/v1/AssetDisposal/Add/Quote`;

    const quoteRequestUrl = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Request/Quote/Update`;
    const callback = () => {
      hideDialog();
      refreshData();
    };
    const errorHandler = (err) => {
      ConsoleHelper(err);
      generalErrorAlert(err.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
    };

    sendPostRequest(
      [quoteDataUrl, quoteRequestUrl],
      [quoteData, quoteRequest],
      getAuthHeader(),
      callback,
      errorHandler
    );
  };

  const refreshData = async () => {
    const cancelTokenSource = axios.CancelToken.source();
    const requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetDisposal/Get/${selectedClient}`;

    const callback = (result) => {
      let selectedAsset;
      const validStatus = ["waiting for vendor", "awaiting approval", "cancelled", "denied"];
      const disposals = result.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));
      for (const ele of disposals) {
        if (ele.custom_id === asset.custom_id) {
          selectedAsset = ele;
        }
      }
      setAllRequests(disposals);
      setSelectedAsset(selectedAsset);
      setDataReady(false);
      quote && quote.modified_by
        ? successAlert("msg", t("removalDetails.success_update_quote"))
        : successAlert("msg", t("removalDetails.success_add_quote"));
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

  const renderFooter = () => {
    return (
      <div>
        <Button
          label={t("general.submit")}
          icon="pi pi-check"
          onClick={handleQuoteUpdate}
          disabled={!cost || !files.length}
          autoFocus
        />
      </div>
    );
  };

  return (
    <Dialog
      className="custom-main-dialog"
      header={
        quote && quote.modified_by
          ? t("removalDetails.update_disposal_quote")
          : t("removalDetails.add_disposal_quote")
      }
      visible={editDialogStatus}
      onHide={hideDialog}
      style={{ width: "50vw" }}
      breakpoints={{ "1440px": "75vw", "980px": "85vw", "600px": "90vw" }}
      footer={renderFooter}
    >
      <div className="p-field">
        <label>{t("general.estimated_total_cost")}</label>
        <CustomInputNumber
          value={cost}
          onChange={(v) => setCost(v)}
          className="w-100"
          mode="decimal"
          minFractionDigits={2}
          maxFractionDigits={2}
          max={2147483646}
          leftStatus
        />
      </div>
      <div className="p-field">
        <label>{t("fileUploadInput.add_quote_file")}</label>
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
    </Dialog>
  );
};

export default DisposalQuoteUpdate;
