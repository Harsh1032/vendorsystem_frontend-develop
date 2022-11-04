import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Button } from "primereact/button";
import * as Constants from "../../../constants";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendGetRequests } from "../../../helpers/HttpRequestHelper";
import DetailsView from "../../ShareComponents/DetailView/DetailsView";
import DetailsViewMobile from "../../ShareComponents/DetailView/DetailsViewMobile";
import AssetRequestStatusUpdate from "./AssetRequestStatusUpdate";
import { capitalize } from "../../../helpers/helperFunctions";
import QuoteDetails from "./QuoteDetails";
import RatingDetails from "../../ShareComponents/RatingDetails";
import UploadRequestFiles from "./UploadRequestFiles";

const AssetOrderDetails = ({
  order,
  setAllRequests,
  selectedClient,
  setSelectedOrder,
  setDataReady,
  disableButtons,
}) => {
  const { t } = useTranslation();
  const [uploadDialogStatus, setUploadDialogStatus] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteReady, setQuoteReady] = useState(false);
  const [ratingData, setRatingData] = useState(null);
  const [ratingReady, setRatingReady] = useState(false);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  const [updateDialogStatus, setUpdateDialogStatus] = useState(false);

  const progressSteps = [
    t("requestProgress.waiting_for_vendor"),
    t("requestProgress.awaiting_approval"),
    t("requestProgress.approved"),
    t("requestProgress.ordered"),
    t("requestProgress.built"),
    t("requestProgress.in_transit_to_client"),
    t("requestProgress.delivered"),
  ];
  const progressContents = [
    t("requestProgress.waiting_for_vendor_content"),
    t("requestProgress.awaiting_approval_content"),
    t("requestProgress.approved_content"),
    t("requestProgress.ordered_content"),
    t("requestProgress.built_content"),
    t("requestProgress.in_transit_to_client_content_" + Boolean(order.vendor_transport_to_client)),
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
        [`${Constants.ENDPOINT_PREFIX}/api-client/v1/Rating/Get/Details/${order.custom_id}`],
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
  }, [ratingReady, order]);

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
            actionBtn1={
              !disableButtons
                ? [t("general.update_status"), "pi-check-circle", "detail-action-color-1"]
                : ""
            }
            onActionBtn1={() => setUpdateDialogStatus(true)}
            disableActionBtn1={!["ordered", "built"].includes(order.status?.toLowerCase())}
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
            progressActive={order.status}
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
          actionBtn1={
            !disableButtons
              ? [t("general.update_status"), "pi-check-circle", "detail-action-color-1"]
              : ""
          }
          onActionBtn1={() => setUpdateDialogStatus(true)}
          disableActionBtn1={!["ordered", "built"].includes(order.status?.toLowerCase())}
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
          progressActive={order.status}
        />
      )}
      <AssetRequestStatusUpdate
        order={order}
        selectedClient={selectedClient}
        setAllRequests={setAllRequests}
        updateDialogStatus={updateDialogStatus}
        setUpdateDialogStatus={setUpdateDialogStatus}
        setSelectedOrder={setSelectedOrder}
      />
      <UploadRequestFiles
        order={order}
        uploadDialogStatus={uploadDialogStatus}
        setUploadDialogStatus={setUploadDialogStatus}
        setSelectedOrder={setSelectedOrder}
        setAllRequests={setAllRequests}
        selectedClient={selectedClient}
      />
    </React.Fragment>
  );
};

export default AssetOrderDetails;
