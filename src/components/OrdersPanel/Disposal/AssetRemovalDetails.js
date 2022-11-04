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
import DisposalStatusUpdate from "./DisposalStatusUpdate";
import QuoteDetails from "./QuoteDetails";
import RatingDetails from "../../ShareComponents/RatingDetails";
import UploadDisposalFiles from "./UploadDisposalFiles";

const AssetRemovalDetails = ({
  asset,
  setSelectedAsset,
  disableButtons,
  setAllRequests,
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
    t("requestProgress.in_progress"),
    t("requestProgress.complete"),
  ];
  const progressContents = [
    t("requestProgress.waiting_for_vendor_content"),
    t("requestProgress.awaiting_approval_content"),
    t("requestProgress.approved_content"),
    t("requestProgress.in_transit_to_vendor_content_" + Boolean(asset.vendor_transport_to_vendor)),
    t("requestProgress.at_vendor_content"),
    t("requestProgress.in_progress_content"),
    t("requestProgress.complete_content"),
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
        [`${Constants.ENDPOINT_PREFIX}/api-client/v1/Rating/Get/Details/${asset.custom_id}`],
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
  }, [ratingReady, asset]);

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
            actionBtn1={
              !disableButtons
                ? [t("general.update_status"), "pi-check-circle", "detail-action-color-1"]
                : ""
            }
            onActionBtn1={() => setCompleteDialogStatus(true)}
            disableActionBtn1={
              !["in transit - to vendor", "at vendor"].includes(asset.status?.toLowerCase())
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
            progressActive={asset.status}
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
          actionBtn1={
            !disableButtons
              ? [t("general.update_status"), "pi-check-circle", "detail-action-color-1"]
              : ""
          }
          onActionBtn1={() => setCompleteDialogStatus(true)}
          disableActionBtn1={
            !["in transit - to vendor", "at vendor"].includes(asset.status?.toLowerCase())
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
          progressActive={asset.status}
        />
      )}
      <DisposalStatusUpdate
        asset={asset}
        setSelectedAsset={setSelectedAsset}
        setAllRequests={setAllRequests}
        selectedClient={selectedClient}
        completeDialogStatus={completeDialogStatus}
        setCompleteDialogStatus={setCompleteDialogStatus}
      />
      <UploadDisposalFiles
        asset={asset}
        uploadDialogStatus={uploadDialogStatus}
        setUploadDialogStatus={setUploadDialogStatus}
        setSelectedAsset={setSelectedAsset}
        setAllRequests={setAllRequests}
        selectedClient={selectedClient}
      />
    </React.Fragment>
  );
};

export default AssetRemovalDetails;
