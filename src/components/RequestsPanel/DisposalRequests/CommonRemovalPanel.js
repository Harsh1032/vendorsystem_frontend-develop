import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import * as Constants from "../../../constants";
import { capitalize } from "../../../helpers/helperFunctions";
import Table from "../../ShareComponents/Table/Table";
import AssetRemovalDetails from "./AssetRemovalDetails";

const CommonRemovalPanel = ({
  removalsData,
  setAllRequests,
  selectedClient,
  dataReady,
  tab,
  selectedAsset,
  setSelectedAsset,
  disableButtons,
  isAllSelected,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  let removalTableHeaders = [];
  let removalTableData = [];

  if (isAllSelected) {
    removalTableHeaders = [
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

    removalTableData = removalsData.map((item) => {
      return {
        id: item.asset_disposal_id,
        dataPoint: item,
        cells: [
          item.client_company || [t("general.not_applicable")],
          item.client_request_custom_id || [t("general.not_applicable")],
          capitalize(item.status),
          item.created_by || [t("general.not_applicable")],
          ...(moment(item.date_created).isValid()
            ? [moment(item.date_created).format("YYYY-MM-DD")]
            : [t("general.not_applicable")]),
        ],
      };
    });
  } else {
    removalTableHeaders = [
      { header: t("general.id"), colFilter: { field: "custom_id" } },
      { header: t("general.vin"), colFilter: { field: "VIN" } },
      {
        header: t("removalPanel.disposal_type_label"),
        colFilter: { field: "disposal_type", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.location"),
        colFilter: { field: "current_location", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.status"),
        colFilter: { field: "status", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("removalPanel.date_vendor_contacted_label"),
        colFilter: {
          field: "vendor_contacted_date",
          filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
        },
      },
      {
        header: t("removalPanel.date_accounting_notified_label"),
        colFilter: {
          field: "accounting_contacted_date",
          filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
        },
      },
      {
        header: t("removalPanel.date_created_label"),
        colFilter: {
          field: "date_created",
          filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
        },
      },
    ];

    removalTableData = removalsData.map((item) => {
      return {
        id: item.id,
        dataPoint: item,
        cells: [
          item.custom_id,
          item.VIN,
          item.disposal_type,
          item.current_location,
          capitalize(item.status),
          ...(moment(item.vendor_contacted_date).isValid()
            ? [moment(item.vendor_contacted_date).format("YYYY-MM-DD")]
            : [t("general.not_applicable")]),
          ...(moment(item.accounting_contacted_date).isValid()
            ? [moment(item.accounting_contacted_date).format("YYYY-MM-DD")]
            : [t("general.not_applicable")]),
          ...(moment(item.date_created).isValid()
            ? [moment(item.date_created).format("YYYY-MM-DD")]
            : [t("general.not_applicable")]),
        ],
      };
    });
  }

  return (
    <React.Fragment>
      {isMobile ? (
        <React.Fragment>
          {selectedAsset ? (
            <AssetRemovalDetails
              asset={selectedAsset}
              selectedClient={selectedClient}
              setAllRequests={setAllRequests}
              setSelectedAsset={setSelectedAsset}
              disableButtons={disableButtons}
            />
          ) : (
            <div className="p-mb-5">
              <Table
                dataReady={dataReady}
                tableHeaders={removalTableHeaders}
                tableData={removalTableData}
                onSelectionChange={
                  !isAllSelected ? (selectedAsset) => setSelectedAsset(selectedAsset) : null
                }
                hasSelection={!isAllSelected}
                tab={tab}
              />
            </div>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Table
            dataReady={dataReady}
            tableHeaders={removalTableHeaders}
            tableData={removalTableData}
            onSelectionChange={
              !isAllSelected ? (selectedAsset) => setSelectedAsset(selectedAsset) : null
            }
            hasSelection={!isAllSelected}
            tab={tab}
          />
          {selectedAsset && (
            <AssetRemovalDetails
              asset={selectedAsset}
              selectedClient={selectedClient}
              setAllRequests={setAllRequests}
              setSelectedAsset={setSelectedAsset}
              disableButtons={disableButtons}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default CommonRemovalPanel;
