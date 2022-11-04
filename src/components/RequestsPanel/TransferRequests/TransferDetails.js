import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Button } from "primereact/button";
import * as Constants from "../../../constants";
import { capitalize } from "../../../helpers/helperFunctions";
import DetailsView from "../../ShareComponents/DetailView/DetailsView";
import DetailsViewMobile from "../../ShareComponents/DetailView/DetailsViewMobile";

const TransferDetails = ({
  transfer,
  selectedClient,
  setAllRequests,
  setSelectedTransfer,
  disableButtons,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });

  const onBack = () => {
    setSelectedTransfer(null);
  };

  const detailViewTitles = [
    t("general.id"),
    t("general.status"),
    t("general.business_unit"),
    t("general.current_location"),
    t("general.destination_location"),
    t("general.estimated_cost"),
    t("general.created_by"),
    t("general.modified_by"),
    t("general.date_created"),
    t("general.date_updated"),
  ];
  const detailViewValues = [
    transfer.custom_id,
    capitalize(transfer.status),
    transfer.business_unit,
    transfer.current_location,
    transfer.destination_location,
    transfer.estimated_cost !== null
      ? transfer.estimated_cost.toFixed(2)
      : t("general.not_applicable"),
    transfer.created_by || t("general.not_applicable"),
    transfer.modified_by || t("general.not_applicable"),
    moment(transfer.date_created).format("YYYY-MM-DD") || t("general.not_applicable"),
    moment(transfer.date_modified).format("YYYY-MM-DD") || t("general.not_applicable"),
  ];

  const InTransitDetails = (
    <div className={`p-d-flex p-flex-column ${isMobile ? "main-details" : ""}`}>
      {isMobile && <hr className="solid" />}
      <span className="title font-weight-bold text-white">
        {`${t("general.additional_details")}:`}
      </span>
      <div className="p-d-flex">
        <span className="detail-title">
          {`${t("removalPanel.interior_condition_of_the_asset")}:`}
        </span>
        <span className="sub-value">&nbsp;&nbsp;{capitalize(transfer.interior_condition)}</span>
      </div>
      <div className="p-d-flex">
        <span className="detail-title">{`${t("removalPanel.interior_condition_details")}:`}</span>
        {transfer.interior_condition_details ? (
          <span className="sub-value">&nbsp;&nbsp;{transfer.interior_condition_details}</span>
        ) : (
          <span className="sub-value">&nbsp;&nbsp;{t("general.not_applicable")}</span>
        )}
      </div>
      <div className="p-d-flex">
        <span className="detail-title">
          {`${t("removalPanel.exterior_condition_of_the_asset")}:`}
        </span>
        <span className="sub-value">&nbsp;&nbsp;{capitalize(transfer.exterior_condition)}</span>
      </div>
      <div className="p-d-flex">
        <span className="detail-title">{`${t("removalPanel.exterior_condition_details")}:`}</span>
        {transfer.exterior_condition_details ? (
          <span className="sub-value">&nbsp;&nbsp;{transfer.exterior_condition_details}</span>
        ) : (
          <span className="sub-value">&nbsp;&nbsp;{t("general.not_applicable")}</span>
        )}
      </div>
      {!isMobile && <hr className="solid" />}
    </div>
  );

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
            header={t("assetTransferPanel.transfer_details")}
            titles={detailViewTitles}
            values={detailViewValues}
            files={transfer.files}
            description={[
              t("assetTransferPanel.transfer_justification"),
              transfer.justification || t("general.not_applicable"),
            ]}
            additionalDescr={
              transfer.status.toLowerCase() === "in transit" ||
              transfer.status.toLowerCase() === "delivered"
                ? InTransitDetails
                : ""
            }
          />
        </div>
      ) : (
        /* Desktop Details View */
        <DetailsView
          headers={[
            t("assetTransferPanel.transfer_details"),
            t("general.header_vin", { vin: transfer.VIN }),
          ]}
          titles={detailViewTitles}
          values={detailViewValues}
          files={transfer.files}
          description={[
            t("assetTransferPanel.transfer_justification"),
            transfer.justification || t("general.not_applicable"),
          ]}
          additionalDescr={
            transfer.status.toLowerCase() === "in transit" ||
            transfer.status.toLowerCase() === "delivered"
              ? InTransitDetails
              : ""
          }
          onHideDialog={setSelectedTransfer}
        />
      )}
    </React.Fragment>
  );
};

export default TransferDetails;
