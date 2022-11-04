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
import RepairStatusUpdate from "./RepairStatusUpdate";
import QuoteDetails from "./QuoteDetails";
import RatingDetails from "../../ShareComponents/RatingDetails";
import UploadRepairFiles from "./UploadRepairFiles";

const RepairDetails = ({
  repair,
  setSelectedRepair,
  setAllRequests,
  disableButtons,
  selectedClient,
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
    t("requestProgress.in_transit_to_vendor_content_" + Boolean(repair.vendor_transport_to_vendor)),
    t("requestProgress.at_vendor_content"),
    t("requestProgress.complete_content"),
    t("requestProgress.in_transit_to_client_content_" + Boolean(repair.vendor_transport_to_client)),
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
        [`${Constants.ENDPOINT_PREFIX}/api-client/v1/Rating/Get/Details/${repair.work_order}`],
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
  }, [ratingReady, repair]);

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
            actionBtn1={
              !disableButtons
                ? [t("general.update_status"), "pi-check-circle", "detail-action-color-1"]
                : ""
            }
            onActionBtn1={() => setCompleteDialogStatus(true)}
            disableActionBtn1={
              !["in transit - to vendor", "at vendor", "complete"].includes(
                repair.status?.toLowerCase()
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
            progressActive={repair.status}
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
          actionBtn1={
            !disableButtons
              ? [t("general.update_status"), "pi-check-circle", "detail-action-color-1"]
              : ""
          }
          onActionBtn1={() => setCompleteDialogStatus(true)}
          disableActionBtn1={
            !["in transit - to vendor", "at vendor", "complete"].includes(
              repair.status?.toLowerCase()
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
          progressActive={repair.status}
        />
      )}
      <RepairStatusUpdate
        repair={repair}
        setSelectedRepair={setSelectedRepair}
        setAllRequests={setAllRequests}
        selectedClient={selectedClient}
        completeDialogStatus={completeDialogStatus}
        setCompleteDialogStatus={setCompleteDialogStatus}
      />
      <UploadRepairFiles
        repair={repair}
        uploadDialogStatus={uploadDialogStatus}
        setUploadDialogStatus={setUploadDialogStatus}
        setSelectedRepair={setSelectedRepair}
        setAllRequests={setAllRequests}
        selectedClient={selectedClient}
      />
    </React.Fragment>
  );
};

export default RepairDetails;
