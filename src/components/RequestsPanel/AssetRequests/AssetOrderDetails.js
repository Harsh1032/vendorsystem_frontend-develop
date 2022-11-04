import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useDispatch } from "react-redux";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Button } from "primereact/button";
import * as Constants from "../../../constants";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendGetRequests, sendPostRequest } from "../../../helpers/HttpRequestHelper";
import DetailsView from "../../ShareComponents/DetailView/DetailsView";
import DetailsViewMobile from "../../ShareComponents/DetailView/DetailsViewMobile";
import AssetQuoteUpdate from "./AssetQuoteUpdate";
import { capitalize } from "../../../helpers/helperFunctions";
import QuoteDetails from "./QuoteDetails";
import ActionGroup from "../../ShareComponents/DetailView/ActionGroup";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const AssetOrderDetails = ({
  order,
  selectedClient,
  setAllRequests,
  setSelectedOrder,
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
  if (order.quote_deadline) {
    expireTime = new Date(order.quote_deadline).getTime();
    expireDate = moment(order.quote_deadline).format("YYYY-MM-DD LT");
  } else {
    const expireDays = 10;
    const timeOfCreated = new Date(order.date_created).getTime();
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
        setQuoteData(null);
        setQuoteReady(true);
      };

      sendGetRequests(
        [`${Constants.ENDPOINT_PREFIX}/api/v1/AssetRequest/Get/Quote/Details/${order.custom_id}`],
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
  }, [quoteReady, order, disableButtons]);

  const onBack = () => {
    setSelectedOrder(null);
  };

  const detailViewTitles = [
    t("general.id"),
    t("general.status"),
    t("general.asset_type"),
    t("assetOrderDetails.business_unit_label"),
    t("assetOrderDetails.manufacturer_label"),
    t("assetOrderDetails.equipment_type_label"),
    t("assetOrderDetails.date_required_label"),
    t("assetOrderDetails.justification_label"),
    t("general.created_by"),
    t("general.modified_by"),
    t("general.date_created"),
    t("general.date_updated"),
  ];

  const detailViewValues = [
    order.custom_id,
    capitalize(order.status),
    order.asset_type,
    order.business_unit,
    order.manufacturer,
    order.model_number,
    moment(order.date_required).format("YYYY-MM-DD"),
    order.justification,
    order.created_by,
    order.modified_by || t("general.not_applicable"),
    moment(order.date_created).format("YYYY-MM-DD"),
    moment(order.date_updated).format("YYYY-MM-DD"),
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
    let requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetRequest/Get/${selectedClient}`;
    const quoteStatus = JSON.parse(quoteRequest.get("data"))["status"];
    const callback = (result) => {
      let selectedOrder;
      let validStatus = ["waiting for vendor", "awaiting approval", "cancelled", "denied"];
      let assetOrders = result.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));
      for (let ele of assetOrders) {
        if (ele.custom_id === order.custom_id) {
          selectedOrder = ele;
        }
      }
      setAllRequests(assetOrders);
      if (quoteStatus === "sent") {
        setSelectedOrder(selectedOrder);
        successAlert("msg", t("approvalDetails.accept_success"));
        setEditDialogStatus(true);
      } else if (quoteStatus === "rejected") {
        setSelectedOrder(null);
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
        request_custom_id: order.custom_id,
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
        request_custom_id: order.custom_id,
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
        <div>
          <div className="no-style-btn p-my-3">
            <Button
              label={t("general.back")}
              className="p-button-link"
              icon="pi pi-chevron-left"
              onClick={() => onBack()}
            />
          </div>
          <DetailsViewMobile
            header={t("assetOrderDetails.header")}
            titles={detailViewTitles}
            values={detailViewValues}
            files={order.files}
            description={[
              t("assetOrderDetails.nonstandard_description_title"),
              order.nonstandard_description || t("general.not_applicable"),
            ]}
            editBtn={
              !disableButtons && order.quotes[0].status === "sent"
                ? !quoteReady
                  ? t("formDropdown.loading")
                  : quoteData && quoteData.modified_by
                  ? t("assetOrderDetails.update_order_quote")
                  : t("assetOrderDetails.add_order_quote")
                : ""
            }
            onEdit={() => setEditDialogStatus(true)}
            disableEditBtn={!quoteReady || isExpired}
            btnGroup={
              !disableButtons && order.quotes[0].status === "pending" ? (
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
              ["pending", "sent"].includes(order.quotes[0].status) && (
                <ExpireNotification isExpired={isExpired} expireDate={expireDate} />
              )
            }
            additionalDescr={
              !disableButtons &&
              ["sent", "approved"].includes(order.quotes[0].status) && (
                <QuoteDetails quote={quoteData} dataReady={quoteReady} />
              )
            }
          />
        </div>
      ) : (
        <DetailsView
          headers={[t("assetOrderDetails.header")]}
          titles={detailViewTitles}
          values={detailViewValues}
          files={order.files}
          description={[
            t("assetOrderDetails.nonstandard_description_title"),
            order.nonstandard_description || t("general.not_applicable"),
          ]}
          onHideDialog={setSelectedOrder}
          editBtn={
            !disableButtons && order.quotes[0].status === "sent"
              ? !quoteReady
                ? t("formDropdown.loading")
                : quoteData && quoteData.modified_by
                ? t("assetOrderDetails.update_order_quote")
                : t("assetOrderDetails.add_order_quote")
              : ""
          }
          onEdit={() => setEditDialogStatus(true)}
          disableEditBtn={!quoteReady || isExpired}
          btnGroup={
            !disableButtons && order.quotes[0].status === "pending" ? (
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
            ["pending", "sent"].includes(order.quotes[0].status) && (
              <ExpireNotification isExpired={isExpired} expireDate={expireDate} />
            )
          }
          additionalDescr={
            !disableButtons &&
            ["sent", "approved"].includes(order.quotes[0].status) && (
              <QuoteDetails quote={quoteData} dataReady={quoteReady} />
            )
          }
        />
      )}
      <AssetQuoteUpdate
        request={order}
        editDialogStatus={editDialogStatus}
        setEditDialogStatus={setEditDialogStatus}
        quote={quoteData}
        setDataReady={setQuoteReady}
        selectedClient={selectedClient}
        setAllRequests={setAllRequests}
        setSelectedOrder={setSelectedOrder}
      />
    </React.Fragment>
  );
};

export default AssetOrderDetails;
