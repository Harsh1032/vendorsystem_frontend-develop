import React, { useEffect } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import * as Constants from "../../../constants";
import { Table } from "../../ShareComponents/Table";
import { capitalize } from "../../../helpers/helperFunctions";
import AssetOrderDetails from "./AssetOrderDetails";

const CommonAssetOrdersPanel = ({
  assetOrders,
  setAllRequests,
  selectedClient,
  dataReady,
  tab,
  selectedAssetOrder,
  setSelectedAssetOrder,
  disableButtons,
  isAllSelected,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  let TableHeaders = [];
  let TableData = [];

  useEffect(() => {
    setSelectedAssetOrder(null);
  }, [setSelectedAssetOrder]);

  if (!assetOrders) return null;

  if (isAllSelected) {
    TableHeaders = [
      { header: t("general.client"), colFilter: { field: "client_company" } },

      { header: t("general.id"), colFilter: { field: "client_request_custom_id" } },

      {
        header: t("general.status"),
        colFilter: { field: "status", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.created_by"),
        colFilter: { field: "created_by", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.date_created"),
        colFilter: {
          field: "date_created",
          filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
        },
      },
    ];

    TableData = assetOrders.map((assetOrder) => {
      return {
        id: assetOrder.asset_request_quote_id,
        dataPoint: assetOrder,
        cells: [
          assetOrder.client_company || [t("general.not_applicable")],
          assetOrder.client_request_custom_id || [t("general.not_applicable")],
          capitalize(assetOrder.status),
          assetOrder.created_by || [t("general.not_applicable")],
          ...(moment(assetOrder.date_created).isValid()
            ? [moment(assetOrder.date_created).format("YYYY-MM-DD")]
            : [t("general.not_applicable")]),
        ],
      };
    });
  } else {
    TableHeaders = [
      { header: t("general.id"), colFilter: { field: "custom_id" } },
      {
        header: t("general.asset_type"),
        colFilter: { field: "asset_type", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("assetOrderDetails.equipment_type_label"),
        colFilter: { field: "model_number", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.business_unit"),
        colFilter: { field: "business_unit", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.status"),
        colFilter: { field: "status", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("assetOrderDetails.date_required_label"),
        colFilter: {
          field: "date_required",
          filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
        },
      },
    ];

    TableData = assetOrders.map((assetOrder) => {
      return {
        id: assetOrder.id,
        dataPoint: assetOrder,
        cells: [
          assetOrder.custom_id,
          assetOrder.asset_type,
          assetOrder.model_number,
          assetOrder.business_unit,
          capitalize(assetOrder.status),
          ...(moment(assetOrder.date_required).isValid()
            ? [moment(assetOrder.date_required).format("YYYY-MM-DD")]
            : [t("general.not_applicable")]),
        ],
      };
    });
  }

  return (
    <React.Fragment>
      {isMobile ? (
        <div className="p-mb-5">
          {selectedAssetOrder ? (
            <AssetOrderDetails
              order={selectedAssetOrder}
              selectedClient={selectedClient}
              setAllRequests={setAllRequests}
              setSelectedOrder={setSelectedAssetOrder}
              disableButtons={disableButtons}
            />
          ) : (
            <Table
              dataReady={dataReady}
              tableHeaders={TableHeaders}
              tableData={TableData}
              onSelectionChange={
                !isAllSelected ? (assetOrder) => setSelectedAssetOrder(assetOrder) : null
              }
              hasSelection={!isAllSelected}
              tab={tab}
            />
          )}
        </div>
      ) : (
        <React.Fragment>
          <Table
            dataReady={dataReady}
            tableHeaders={TableHeaders}
            tableData={TableData}
            onSelectionChange={
              !isAllSelected ? (assetOrder) => setSelectedAssetOrder(assetOrder) : null
            }
            hasSelection={!isAllSelected}
            tab={tab}
          />
          {selectedAssetOrder && (
            <AssetOrderDetails
              order={selectedAssetOrder}
              selectedClient={selectedClient}
              setAllRequests={setAllRequests}
              setSelectedOrder={setSelectedAssetOrder}
              disableButtons={disableButtons}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default CommonAssetOrdersPanel;
