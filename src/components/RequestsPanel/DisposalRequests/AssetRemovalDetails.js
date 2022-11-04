import React, { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { useDispatch } from "react-redux";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Button } from "primereact/button";
import * as Constants from "../../../constants";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendGetRequests, sendPostRequest } from "../../../helpers/HttpRequestHelper";
import { capitalize } from "../../../helpers/helperFunctions";
import DetailsView from "../../ShareComponents/DetailView/DetailsView";
import DetailsViewMobile from "../../ShareComponents/DetailView/DetailsViewMobile";
import DisposalQuoteUpdate from "./DisposalQuoteUpdate";
import QuoteDetails from "./QuoteDetails";
import ActionGroup from "../../ShareComponents/DetailView/ActionGroup";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const AssetRemovalDetails = ({
  asset,
  selectedClient,
  setAllRequests,
  setSelectedAsset,
  disableButtons,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [editDialogStatus, setEditDialogStatus] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteReady, setQuoteReady] = useState(false);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });

  //EXPIREDAYS CHANGE BASED ON INFO IN REQUEST
  let expireTime;
  let expireDate;
  let isExpired = false;
  const timeOfNow = new Date().getTime();
  if (asset.quote_deadline) {
    expireTime = new Date(asset.quote_deadline).getTime();
    expireDate = moment(asset.quote_deadline).format("YYYY-MM-DD LT");
  } else {
    const expireDays = 10;
    const timeOfCreated = new Date(asset.date_created).getTime();
    const timeOfExpireDays = expireDays * 24 * 60 * 60 * 1000;
    expireTime = timeOfCreated + timeOfExpireDays;
    expireDate = moment(expireTime).format("YYYY-MM-DD LT");
  }

  if (timeOfNow > expireTime) {
    isExpired = true;
  }

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (!quoteReady && !disableButtons) {
      const callback = (res, status) => {
        if (status === "fulfilled") {
          setQuoteData(res.data);
          setQuoteReady(true);
        } else {
          setQuoteData(null);
          setQuoteReady(true);
        }
      };
      const errorHandler = () => {
        setQuoteReady(true);
      };

      sendGetRequests(
        [`${Constants.ENDPOINT_PREFIX}/api/v1/AssetDisposal/Get/Quote/Details/${asset.custom_id}`],
        {
          ...getAuthHeader(),
          cancelToken: cancelTokenSource.token,
        },
        [callback],
        errorHandler
      );
    }
    return () => {
      //Doing clean up work, cancel the asynchronous api call
      cancelTokenSource.cancel("cancel the asynchronous api call from custom hook");
    };
  }, [quoteReady, asset, disableButtons]);

  const onBack = () => {
    setSelectedAsset(null);
  };

  let detailViewTitles = [
    t("general.id"),
    t("general.status"),
    t("general.asset_type"),
    t("fleetPanel.manufacturer_label"),
    t("general.model_number"),
    t("removalDetails.disposal_reason"),
    t("removalDetails.refurbish_required"),
    t("removalDetails.interior_condition"),
    t("removalDetails.exterior_condition"),
    t("general.available_pickup_date"),
    t("general.created_by"),
    t("general.modified_by"),
    t("general.date_created"),
    t("general.date_updated"),
  ];

  let detailViewValues = [
    asset.custom_id,
    capitalize(asset.status),
    asset.asset_type,
    asset.manufacturer || t("general.not_applicable"),
    asset.model_number || t("general.not_applicable"),
    capitalize(asset.disposal_reason),
    asset.refurbished ? t("general.yes") : t("general.no"),
    capitalize(asset.interior_condition),
    capitalize(asset.exterior_condition),
    moment(asset.available_pickup_date).isValid()
      ? moment(asset.available_pickup_date).format("YYYY-MM-DD")
      : t("general.not_applicable"),
    asset.created_by || t("general.not_applicable"),
    asset.modified_by || t("general.not_applicable"),
    moment(asset.date_created).isValid()
      ? moment(asset.date_created).format("YYYY-MM-DD")
      : t("general.not_applicable"),
    moment(asset.date_modified).isValid()
      ? moment(asset.date_modified).format("YYYY-MM-DD")
      : t("general.not_applicable"),
  ];

  const sendQuoteRequest = (quoteRequest) => {
    loadingAlert();
    const callback = () => {
      refreshData(quoteRequest);
    };
    const errorHandler = (err) => {
      ConsoleHelper(err);
      generalErrorAlert(err.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
    };
    const url = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Request/Quote/Update`;

    sendPostRequest(url, quoteRequest, getAuthHeader(), callback, errorHandler);
  };

  const refreshData = (quoteRequest) => {
    const cancelTokenSource = axios.CancelToken.source();
    let requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetDisposal/Get/${selectedClient}`;
    const quoteStatus = JSON.parse(quoteRequest.get("data"))["status"];
    const callback = (result) => {
      let selectedAsset;
      let validStatus = ["waiting for vendor", "awaiting approval", "cancelled", "denied"];
      let disposals = result.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));
      for (let ele of disposals) {
        if (ele.custom_id === asset.custom_id) {
          selectedAsset = ele;
        }
      }
      setAllRequests(disposals);
      if (quoteStatus === "sent") {
        setSelectedAsset(selectedAsset);
        successAlert("msg", t("approvalDetails.accept_success"));
        setEditDialogStatus(true);
      } else if (quoteStatus === "rejected") {
        setSelectedAsset(null);
        successAlert("msg", t("approvalDetails.reject_success"));
      }
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

  const onAccept = () => {
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
    quoteRequest.append("file_specs", JSON.stringify(required_file_specs));
    sendQuoteRequest(quoteRequest);
  };

  const onReject = () => {
    let quoteRequest = new FormData();
    quoteRequest.append(
      "data",
      JSON.stringify({
        request_custom_id: asset.custom_id,
        status: "rejected",
      })
    );
    let required_file_specs = {
      file_info: [],
    };
    quoteRequest.append("file_specs", JSON.stringify(required_file_specs));
    sendQuoteRequest(quoteRequest);
  };

  const ExpireNotification = ({ isExpired, expireDate }) => {
    return (
      <div className="p-mt-3 p-d-flex p-jc-center p-ai-center">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <span className="p-ml-2">
          {isExpired
            ? t("general.expired_notify")
            : t("general.not_expired_notify", { expire_date: expireDate })}
        </span>
      </div>
    );
  };

  return (
    <React.Fragment>
      {isMobile ? (
        <div className="p-mb-5">
          <div className="no-style-btn p-my-3">
            <Button
              label={t("general.back")}
              className="p-button-link"
              icon="pi pi-chevron-left"
              onClick={() => onBack()}
            />
          </div>
          <DetailsViewMobile
            header={t("general.header_vin", { vin: asset.VIN })}
            titles={detailViewTitles}
            values={detailViewValues}
            description={[
              t("removalDetails.ex_interior_details_title"),
              t("removalDetails.interior_details") +
                ": " +
                (asset.interior_condition_details || t("general.not_applicable")),
              t("removalDetails.exterior_details") +
                ": " +
                (asset.exterior_condition_details || t("general.not_applicable")),
            ]}
            files={asset.files}
            editBtn={
              !disableButtons && asset.quotes[0].status === "sent"
                ? !quoteReady
                  ? t("formDropdown.loading")
                  : quoteData && quoteData.modified_by
                  ? t("removalDetails.update_disposal_quote")
                  : t("removalDetails.add_disposal_quote")
                : ""
            }
            onEdit={() => setEditDialogStatus(true)}
            disableEditBtn={!quoteReady || isExpired}
            btnGroup={
              !disableButtons && asset.quotes[0].status === "pending" ? (
                <ActionGroup
                  onAccept={onAccept}
                  onReject={onReject}
                  isMobile={isMobile}
                  disabled={isExpired}
                />
              ) : null
            }
            otherItemsBefore={
              !disableButtons &&
              ["pending", "sent"].includes(asset.quotes[0].status) && (
                <ExpireNotification isExpired={isExpired} expireDate={expireDate} />
              )
            }
            additionalDescr={
              !disableButtons &&
              ["sent", "approved"].includes(asset.quotes[0].status) && (
                <QuoteDetails quote={quoteData} dataReady={quoteReady} />
              )
            }
          />
        </div>
      ) : (
        <DetailsView
          headers={[t("removalDetails.page_title"), t("general.header_vin", { vin: asset.VIN })]}
          titles={detailViewTitles}
          values={detailViewValues}
          description={[
            t("removalDetails.ex_interior_details_title"),
            t("removalDetails.interior_details") +
              ": " +
              (asset.interior_condition_details || t("general.not_applicable")),
            t("removalDetails.exterior_details") +
              ": " +
              (asset.exterior_condition_details || t("general.not_applicable")),
          ]}
          files={asset.files}
          onHideDialog={setSelectedAsset}
          editBtn={
            !disableButtons && asset.quotes[0].status === "sent"
              ? !quoteReady
                ? t("formDropdown.loading")
                : quoteData && quoteData.modified_by
                ? t("removalDetails.update_disposal_quote")
                : t("removalDetails.add_disposal_quote")
              : ""
          }
          onEdit={() => setEditDialogStatus(true)}
          disableEditBtn={!quoteReady || isExpired}
          btnGroup={
            !disableButtons && asset.quotes[0].status === "pending" ? (
              <ActionGroup
                onAccept={onAccept}
                onReject={onReject}
                isMobile={isMobile}
                disabled={isExpired}
              />
            ) : null
          }
          otherItemsBefore={
            !disableButtons &&
            ["pending", "sent"].includes(asset.quotes[0].status) && (
              <ExpireNotification isExpired={isExpired} expireDate={expireDate} />
            )
          }
          additionalDescr={
            !disableButtons &&
            ["sent", "approved"].includes(asset.quotes[0].status) && (
              <QuoteDetails quote={quoteData} dataReady={quoteReady} />
            )
          }
        />
      )}
      <DisposalQuoteUpdate
        asset={asset}
        editDialogStatus={editDialogStatus}
        setEditDialogStatus={setEditDialogStatus}
        quote={quoteData}
        setDataReady={setQuoteReady}
        selectedClient={selectedClient}
        setAllRequests={setAllRequests}
        setSelectedAsset={setSelectedAsset}
      />
    </React.Fragment>
  );
};

export default AssetRemovalDetails;
