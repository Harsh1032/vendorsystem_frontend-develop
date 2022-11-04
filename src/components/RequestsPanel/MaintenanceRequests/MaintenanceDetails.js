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
import MaintenanceQuoteUpdate from "./MaintenanceQuoteUpdate";
import QuoteDetails from "./QuoteDetails";
import ActionGroup from "../../ShareComponents/DetailView/ActionGroup";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import "../../../styles/helpers/button4.scss";

const MaintenanceDetails = ({
  maintenance,
  selectedClient,
  setAllRequests,
  setSelectedMaintenance,
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
  if (maintenance.quote_deadline) {
    expireTime = new Date(maintenance.quote_deadline).getTime();
    expireDate = moment(maintenance.quote_deadline).format("YYYY-MM-DD LT");
  } else {
    const expireDays = 10;
    const timeOfCreated = new Date(maintenance.date_created).getTime();
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
        [
          `${Constants.ENDPOINT_PREFIX}/api/v1/Maintenance/Get/Quote/Details/${maintenance.work_order}`,
        ],
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
  }, [quoteReady, maintenance, disableButtons]);

  const onBack = () => {
    setSelectedMaintenance(null);
  };

  let detailViewTitles = [
    t("general.id"),
    t("general.inspection_type"),
    t("general.status"),
    ...(maintenance.status === "delivered" ? [t("general.date_completed")] : []),
    t("general.asset_type"),
    t("general.location"),
    ...(maintenance.mileage !== -1.0 ? [t("general.mileage")] : []),
    ...(maintenance.hours !== -1.0 ? [t("general.hours")] : []),
    ...(maintenance.status !== "delivered" ? [t("general.requested_delivery_date")] : []),
    ...(maintenance.status !== "delivered" ? [t("general.estimated_delivery_date")] : []),
    ...(maintenance.status !== "delivered" ? [t("general.available_pickup_date")] : []),
    ...(maintenance.status !== "delivered" ? [t("general.vendor_contacted_date")] : []),
    t("general.created_by"),
    t("general.modified_by"),
    t("general.date_created"),
    t("general.date_updated"),
  ];

  let detailViewValues = [
    maintenance.work_order,
    maintenance.inspection_type,
    capitalize(maintenance.status),
    ...(maintenance.status === "delivered"
      ? [moment(maintenance.date_completed).format("YYYY-MM-DD")]
      : []),
    maintenance.asset_type,
    maintenance.current_location,
    ...(maintenance.mileage !== -1.0 ? [maintenance.mileage] : []),
    ...(maintenance.hours !== -1.0 ? [maintenance.hours] : []),
    ...(maintenance.status !== "delivered"
      ? moment(maintenance.requested_delivery_date).isValid()
        ? [moment(maintenance.requested_delivery_date).format("YYYY-MM-DD")]
        : [t("general.not_applicable")]
      : []),
    ...(maintenance.status !== "delivered"
      ? moment(maintenance.estimated_delivery_date).isValid()
        ? [moment(maintenance.estimated_delivery_date).format("YYYY-MM-DD")]
        : [t("general.not_applicable")]
      : []),
    ...(maintenance.status !== "delivered"
      ? moment(maintenance.available_pickup_date).isValid()
        ? [moment(maintenance.available_pickup_date).format("YYYY-MM-DD")]
        : [t("general.not_applicable")]
      : []),
    ...(maintenance.status !== "delivered"
      ? moment(maintenance.vendor_contacted_date).isValid()
        ? [moment(maintenance.vendor_contacted_date).format("YYYY-MM-DD")]
        : [t("general.not_applicable")]
      : []),
    maintenance.created_by,
    maintenance.modified_by,
    moment(maintenance.date_created).format("YYYY-MM-DD"),
    moment(maintenance.date_updated).format("YYYY-MM-DD"),
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
    let requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Maintenance/Get/${selectedClient}`;
    const quoteStatus = JSON.parse(quoteRequest.get("data"))["status"];
    const callback = (result) => {
      let selectedMaintenance;
      let validStatus = ["waiting for vendor", "awaiting approval", "cancelled", "denied"];
      let maintenanceRequest = result.data.filter((el) =>
        validStatus.includes(el.status?.toLowerCase())
      );
      for (let ele of maintenanceRequest) {
        if (ele.work_order === maintenance.work_order) {
          selectedMaintenance = ele;
        }
      }
      setAllRequests(maintenanceRequest);
      if (quoteStatus === "sent") {
        setSelectedMaintenance(selectedMaintenance);
        successAlert("msg", t("approvalDetails.accept_success"));
        setEditDialogStatus(true);
      } else if (quoteStatus === "rejected") {
        setSelectedMaintenance(null);
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
        request_custom_id: maintenance.work_order,
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
        request_custom_id: maintenance.work_order,
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
            header={t("general.header_vin", { vin: maintenance.VIN })}
            titles={detailViewTitles}
            values={detailViewValues}
            files={maintenance.files}
            editBtn={
              !disableButtons && maintenance.quotes[0].status === "sent"
                ? !quoteReady
                  ? t("formDropdown.loading")
                  : quoteData && quoteData.modified_by
                  ? t("maintenanceDetails.update_maintenance_quote")
                  : t("maintenanceDetails.add_maintenance_quote")
                : ""
            }
            onEdit={() => setEditDialogStatus(true)}
            disableEditBtn={!quoteReady || isExpired}
            btnGroup={
              !disableButtons && maintenance.quotes[0].status === "pending" ? (
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
              ["pending", "sent"].includes(maintenance.quotes[0].status) && (
                <ExpireNotification isExpired={isExpired} expireDate={expireDate} />
              )
            }
            additionalDescr={
              !disableButtons &&
              ["sent", "approved"].includes(maintenance.quotes[0].status) && (
                <QuoteDetails quote={quoteData} dataReady={quoteReady} />
              )
            }
          />
        </div>
      ) : (
        /* Desktop Details View */
        <DetailsView
          headers={[
            t("maintenanceDetails.maintenance_request_details"),
            t("general.header_vin", { vin: maintenance.VIN }),
          ]}
          titles={detailViewTitles}
          values={detailViewValues}
          files={maintenance.files}
          onHideDialog={setSelectedMaintenance}
          editBtn={
            !disableButtons && maintenance.quotes[0].status === "sent"
              ? !quoteReady
                ? t("formDropdown.loading")
                : quoteData && quoteData.modified_by
                ? t("maintenanceDetails.update_maintenance_quote")
                : t("maintenanceDetails.add_maintenance_quote")
              : ""
          }
          onEdit={() => setEditDialogStatus(true)}
          disableEditBtn={!quoteReady || isExpired}
          btnGroup={
            !disableButtons && maintenance.quotes[0].status === "pending" ? (
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
            ["pending", "sent"].includes(maintenance.quotes[0].status) && (
              <ExpireNotification isExpired={isExpired} expireDate={expireDate} />
            )
          }
          additionalDescr={
            !disableButtons &&
            ["sent", "approved"].includes(maintenance.quotes[0].status) && (
              <QuoteDetails quote={quoteData} dataReady={quoteReady} />
            )
          }
        />
      )}
      <MaintenanceQuoteUpdate
        maintenance={maintenance}
        editDialogStatus={editDialogStatus}
        setEditDialogStatus={setEditDialogStatus}
        quote={quoteData}
        setDataReady={setQuoteReady}
        selectedClient={selectedClient}
        setAllRequests={setAllRequests}
        setSelectedMaintenance={setSelectedMaintenance}
      />
    </React.Fragment>
  );
};

export default MaintenanceDetails;
