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
import RepairQuoteUpdate from "./RepairQuoteUpdate";
import QuoteDetails from "./QuoteDetails";
import ActionGroup from "../../ShareComponents/DetailView/ActionGroup";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const RepairDetails = ({
  repair,
  selectedClient,
  setAllRequests,
  setSelectedRepair,
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
  if (repair.quote_deadline) {
    expireTime = new Date(repair.quote_deadline).getTime();
    expireDate = moment(repair.quote_deadline).format("YYYY-MM-DD LT");
  } else {
    const expireDays = 10;
    const timeOfCreated = new Date(repair.date_created).getTime();
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
        [`${Constants.ENDPOINT_PREFIX}/api/v1/Repair/Get/Quote/Details/${repair.work_order}`],
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
  }, [quoteReady, repair, disableButtons]);

  const onBack = () => {
    setSelectedRepair(null);
  };

  let detailViewTitles = [
    t("general.id"),
    t("general.status"),
    ...(repair.status === "complete" ? [t("general.date_completed")] : []),
    t("general.asset_type"),
    t("general.division"),
    t("general.location"),
    ...(repair.mileage !== -1.0 ? [t("general.mileage")] : []),
    ...(repair.hours !== -1.0 ? [t("general.hours")] : []),
    ...(repair.status !== "complete" ? [t("general.requested_delivery_date")] : []),
    ...(repair.status !== "complete" ? [t("general.estimated_delivery_date")] : []),
    ...(repair.status !== "complete" ? [t("general.available_pickup_date")] : []),
    t("general.created_by"),
    t("general.modified_by"),
    t("general.date_created"),
    t("general.date_updated"),
  ];

  let detailViewValues = [
    repair.work_order,
    capitalize(repair.status),
    ...(repair.status === "complete" ? [moment(repair.date_completed).format("YYYY-MM-DD")] : []),
    repair.asset_type,
    repair.business_unit,
    repair.current_location,
    ...(repair.mileage !== -1.0 ? [repair.mileage] : []),
    ...(repair.hours !== -1.0 ? [repair.hours] : []),
    ...(repair.status !== "complete"
      ? moment(repair.requested_delivery_date).isValid()
        ? [moment(repair.requested_delivery_date).format("YYYY-MM-DD")]
        : [t("general.not_applicable")]
      : []),
    ...(repair.status !== "complete"
      ? moment(repair.estimated_delivery_date).isValid()
        ? [moment(repair.estimated_delivery_date).format("YYYY-MM-DD")]
        : [t("general.not_applicable")]
      : []),
    ...(repair.status !== "complete"
      ? moment(repair.available_pickup_date).isValid()
        ? [moment(repair.available_pickup_date).format("YYYY-MM-DD")]
        : [t("general.not_applicable")]
      : []),
    repair.created_by,
    repair.modified_by,
    moment(repair.date_created).format("YYYY-MM-DD"),
    moment(repair.date_modified).format("YYYY-MM-DD"),
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

  const refreshData = async (quoteRequest) => {
    const cancelTokenSource = axios.CancelToken.source();
    let requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Repair/Get/${selectedClient}`;
    const quoteStatus = JSON.parse(quoteRequest.get("data"))["status"];
    const callback = (result) => {
      let selectedRepair;
      let validStatus = ["waiting for vendor", "awaiting approval", "cancelled", "denied"];
      let repairs = result.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));
      for (let ele of repairs) {
        if (ele.work_order === repair.work_order) {
          selectedRepair = ele;
        }
      }
      setAllRequests(repairs);
      if (quoteStatus === "sent") {
        setSelectedRepair(selectedRepair);
        successAlert("msg", t("approvalDetails.accept_success"));
        setEditDialogStatus(true);
      } else if (quoteStatus === "rejected") {
        setSelectedRepair(null);
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
        request_custom_id: repair.work_order,
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
        request_custom_id: repair.work_order,
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
        /* Mobile Details View */
        <div className="p-mx-2">
          <div className="no-style-btn p-my-3">
            <Button
              label={t("general.back")}
              className="p-button-link"
              icon="pi pi-chevron-left"
              onClick={() => onBack()}
            />
          </div>
          <DetailsViewMobile
            header={t("general.header_vin", { vin: repair.VIN })}
            titles={detailViewTitles}
            values={detailViewValues}
            files={repair.files}
            description={[
              `${t("repairRequestPanel.repair_description_label")}:`,
              repair.description || t("general.not_applicable"),
            ]}
            editBtn={
              !disableButtons && repair.quotes[0].status === "sent"
                ? !quoteReady
                  ? t("formDropdown.loading")
                  : quoteData && quoteData.modified_by
                  ? t("repairDetails.update_repair_quote")
                  : t("repairDetails.add_repair_quote")
                : ""
            }
            onEdit={() => setEditDialogStatus(true)}
            disableEditBtn={!quoteReady || isExpired}
            btnGroup={
              !disableButtons && repair.quotes[0].status === "pending" ? (
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
              ["pending", "sent"].includes(repair.quotes[0].status) && (
                <ExpireNotification isExpired={isExpired} expireDate={expireDate} />
              )
            }
            additionalDescr={
              !disableButtons &&
              ["sent", "approved"].includes(repair.quotes[0].status) && (
                <QuoteDetails quote={quoteData} dataReady={quoteReady} />
              )
            }
          />
        </div>
      ) : (
        /* Desktop Details View */
        <DetailsView
          headers={[
            t("repairDetails.repair_details"),
            t("general.header_vin", { vin: repair.VIN }),
          ]}
          titles={detailViewTitles}
          values={detailViewValues}
          files={repair.files}
          description={[
            `${t("repairRequestPanel.repair_description_label")}:`,
            repair.description || t("general.not_applicable"),
          ]}
          onHideDialog={setSelectedRepair}
          editBtn={
            !disableButtons && repair.quotes[0].status === "sent"
              ? !quoteReady
                ? t("formDropdown.loading")
                : quoteData && quoteData.modified_by
                ? t("repairDetails.update_repair_quote")
                : t("repairDetails.add_repair_quote")
              : ""
          }
          onEdit={() => setEditDialogStatus(true)}
          disableEditBtn={!quoteReady || isExpired}
          btnGroup={
            !disableButtons && repair.quotes[0].status === "pending" ? (
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
            ["pending", "sent"].includes(repair.quotes[0].status) && (
              <ExpireNotification isExpired={isExpired} expireDate={expireDate} />
            )
          }
          additionalDescr={
            !disableButtons &&
            ["sent", "approved"].includes(repair.quotes[0].status) && (
              <QuoteDetails quote={quoteData} dataReady={quoteReady} />
            )
          }
        />
      )}
      <RepairQuoteUpdate
        repair={repair}
        editDialogStatus={editDialogStatus}
        setEditDialogStatus={setEditDialogStatus}
        quote={quoteData}
        setDataReady={setQuoteReady}
        selectedClient={selectedClient}
        setAllRequests={setAllRequests}
        setSelectedRepair={setSelectedRepair}
      />
    </React.Fragment>
  );
};

export default RepairDetails;
