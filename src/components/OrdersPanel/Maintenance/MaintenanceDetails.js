import React, { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Button } from "primereact/button";
import * as Constants from "../../../constants";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendGetRequests } from "../../../helpers/HttpRequestHelper";
import { capitalize } from "../../../helpers/helperFunctions";
import DetailsView from "../../ShareComponents/DetailView/DetailsView";
import DetailsViewMobile from "../../ShareComponents/DetailView/DetailsViewMobile";
import MaintenanceStatusUpdate from "./MaintenanceStatusUpdate";
import QuoteDetails from "./QuoteDetails";
import RatingDetails from "../../ShareComponents/RatingDetails";
import UploadMaintenanceFiles from "./UploadMaintenanceFiles";
import "../../../styles/helpers/button4.scss";

const MaintenanceDetails = ({
  maintenance,
  setSelectedMaintenance,
  setAllRequests,
  selectedClient,
  disableButtons,
}) => {
  const { t } = useTranslation();
  const [completeDialogStatus, setCompleteDialogStatus] = useState(false);
  const [uploadDialogStatus, setUploadDialogStatus] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteReady, setQuoteReady] = useState(false);
  const [ratingData, setRatingData] = useState(null);
  const [ratingReady, setRatingReady] = useState(false);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });

  const progressSteps = [
    t("requestProgress.waiting_for_vendor"),
    t("requestProgress.awaiting_approval"),
    t("requestProgress.approved"),
    t("requestProgress.in_transit_to_vendor"),
    t("requestProgress.at_vendor"),
    t("requestProgress.complete"),
    t("requestProgress.in_transit_to_client"),
    t("requestProgress.delivered"),
  ];
  const progressContents = [
    t("requestProgress.waiting_for_vendor_content"),
    t("requestProgress.awaiting_approval_content"),
    t("requestProgress.approved_content"),
    t(
      "requestProgress.in_transit_to_vendor_content_" +
        Boolean(maintenance.vendor_transport_to_vendor)
    ),
    t("requestProgress.at_vendor_content"),
    t("requestProgress.complete_content"),
    t(
      "requestProgress.in_transit_to_client_content_" +
        Boolean(maintenance.vendor_transport_to_client)
    ),
    t("requestProgress.delivered_content"),
  ];

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

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (!ratingReady) {
      const callback = (res, status) => {
        if (status === "fulfilled") {
          setRatingData(res.data);
          setRatingReady(true);
        } else {
          setRatingData(null);
          setRatingReady(true);
        }
      };
      const errorHandler = () => {
        setRatingData(null);
        setRatingReady(true);
      };
      sendGetRequests(
        [`${Constants.ENDPOINT_PREFIX}/api-client/v1/Rating/Get/Details/${maintenance.work_order}`],
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
  }, [ratingReady, maintenance]);

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
            actionBtn1={
              !disableButtons
                ? [t("general.update_status"), "pi-check-circle", "detail-action-color-1"]
                : ""
            }
            onActionBtn1={() => setCompleteDialogStatus(true)}
            disableActionBtn1={
              !["in transit - to vendor", "at vendor", "complete"].includes(
                maintenance.status?.toLowerCase()
              )
            }
            actionBtn2={[
              t("documentTab.upload_document"),
              "pi-cloud-upload",
              "detail-action-color-2",
            ]}
            onActionBtn2={() => setUploadDialogStatus(true)}
            additionalDescr={
              <>
                {!disableButtons && <QuoteDetails quote={quoteData} dataReady={quoteReady} />}
                <RatingDetails data={ratingData} dataReady={ratingReady} />
              </>
            }
            progressSteps={progressSteps}
            progressContents={progressContents}
            progressActive={maintenance.status}
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
          actionBtn1={
            !disableButtons
              ? [t("general.update_status"), "pi-check-circle", "detail-action-color-1"]
              : ""
          }
          onActionBtn1={() => setCompleteDialogStatus(true)}
          disableActionBtn1={
            !["in transit - to vendor", "at vendor", "complete"].includes(
              maintenance.status?.toLowerCase()
            )
          }
          actionBtn2={[
            t("documentTab.upload_document"),
            "pi-cloud-upload",
            "detail-action-color-2",
          ]}
          onActionBtn2={() => setUploadDialogStatus(true)}
          additionalDescr={
            <>
              {!disableButtons && <QuoteDetails quote={quoteData} dataReady={quoteReady} />}
              <RatingDetails data={ratingData} dataReady={ratingReady} />
            </>
          }
          progressSteps={progressSteps}
          progressContents={progressContents}
          progressActive={maintenance.status}
        />
      )}
      <MaintenanceStatusUpdate
        maintenance={maintenance}
        completeDialogStatus={completeDialogStatus}
        setCompleteDialogStatus={setCompleteDialogStatus}
        setSelectedMaintenance={setSelectedMaintenance}
        setAllRequests={setAllRequests}
        selectedClient={selectedClient}
      />
      <UploadMaintenanceFiles
        maintenance={maintenance}
        uploadDialogStatus={uploadDialogStatus}
        setUploadDialogStatus={setUploadDialogStatus}
        setSelectedMaintenance={setSelectedMaintenance}
        setAllRequests={setAllRequests}
        selectedClient={selectedClient}
      />
    </React.Fragment>
  );
};

export default MaintenanceDetails;
