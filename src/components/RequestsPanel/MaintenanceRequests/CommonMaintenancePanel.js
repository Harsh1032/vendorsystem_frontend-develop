import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import * as Constants from "../../../constants";
import MaintenanceDetails from "./MaintenanceDetails";
import { Table } from "../../ShareComponents/Table";
import DateBadge from "../../ShareComponents/helpers/DateBadge";
import { capitalize } from "../../../helpers/helperFunctions";

const CommonMaintenancePanel = ({
  category,
  maintenances,
  setAllRequests,
  selectedClient,
  dataReady,
  tab,
  selectedMaintenance,
  setSelectedMaintenance,
  disableButtons,
  isAllSelected,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  let TableHeaders = [];
  let TableData = [];

  if (!maintenances) return null;

  if (isAllSelected) {
    if (category === "pending") {
      TableHeaders = [
        { header: t("general.client"), colFilter: { field: "client_company" } },

        { header: t("general.id"), colFilter: { field: "client_request_work_order" } },

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

      TableData = maintenances.map((maintenance) => {
        return {
          id: maintenance.maintenance_quote_id,
          dataPoint: maintenance,
          cells: [
            maintenance.client_company || [t("general.not_applicable")],
            maintenance.client_request_work_order || [t("general.not_applicable")],
            capitalize(maintenance.status),
            maintenance.created_by || [t("general.not_applicable")],
            ...(moment(maintenance.date_created).isValid()
              ? [moment(maintenance.date_created).format("YYYY-MM-DD")]
              : [t("general.not_applicable")]),
          ],
        };
      });
    } else if (category === "rejected") {
      TableHeaders = [
        { header: t("general.client"), colFilter: { field: "client_company" } },

        { header: t("general.id"), colFilter: { field: "client_request_work_order" } },

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

      TableData = maintenances.map((maintenance) => {
        return {
          id: maintenance.maintenance_quote_id,
          dataPoint: maintenance,
          cells: [
            maintenance.client_company || [t("general.not_applicable")],
            maintenance.client_request_work_order || [t("general.not_applicable")],
            capitalize(maintenance.status),
            maintenance.created_by || [t("general.not_applicable")],
            ...(moment(maintenance.date_created).isValid()
              ? [moment(maintenance.date_created).format("YYYY-MM-DD")]
              : [t("general.not_applicable")]),
          ],
        };
      });
    }
  } else {
    if (category === "pending") {
      TableHeaders = [
        { header: t("general.id"), colFilter: { field: "work_order" } },
        { header: t("general.vin"), colFilter: { field: "VIN" } },
        {
          header: t("general.asset_type"),
          colFilter: { field: "asset_type", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("general.inspection_type"),
          colFilter: { field: "inspection_type", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("general.status"),
          colFilter: { field: "status", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("general.location"),
          colFilter: { field: "current_location", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("maintenancePanelIndex.expected_delivery_date"),
          colFilter: {
            field: "estimated_delivery_date",
            filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
          },
        },
      ];
      TableData = maintenances.map((maintenance) => {
        return {
          id: maintenance.maintenance_id,
          dataPoint: maintenance,
          cells: [
            maintenance.work_order,
            maintenance.VIN,
            maintenance.asset_type || t("general.not_applicable"),
            maintenance.inspection_type,
            capitalize(maintenance.status),
            maintenance.current_location,
            ...(moment(maintenance.estimated_delivery_date).isValid()
              ? [
                  <DateBadge
                    currentDate={moment(maintenance.estimated_delivery_date).format("YYYY-MM-DD")}
                    dateRange={2}
                  />,
                ]
              : [t("general.not_applicable")]),
          ],
        };
      });
    } else if (category === "rejected") {
      TableHeaders = [
        { header: t("general.id"), colFilter: { field: "work_order" } },
        { header: t("general.vin"), colFilter: { field: "VIN" } },
        {
          header: t("general.asset_type"),
          colFilter: { field: "asset_type", filterOptions: { filterAs: "dropdown" } },
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
          header: t("maintenancePanelIndex.date_completed"),
          colFilter: {
            field: "date_completed",
            filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
          },
        },
      ];
      TableData = maintenances.map((maintenance) => {
        return {
          id: maintenance.maintenance_id,
          dataPoint: maintenance,
          cells: [
            maintenance.work_order,
            maintenance.VIN,
            maintenance.asset_type || t("general.not_applicable"),
            maintenance.current_location || t("general.not_applicable"),
            capitalize(maintenance.status),
            ...(moment(maintenance.date_completed).isValid()
              ? [moment(maintenance.date_completed).format("YYYY-MM-DD")]
              : [t("general.not_applicable")]),
          ],
        };
      });
    }
  }

  return (
    <React.Fragment>
      {isMobile ? (
        <React.Fragment>
          {selectedMaintenance ? (
            <div className="p-mb-5">
              <MaintenanceDetails
                maintenance={selectedMaintenance}
                selectedClient={selectedClient}
                setAllRequests={setAllRequests}
                setSelectedMaintenance={setSelectedMaintenance}
                disableButtons={disableButtons}
              />
            </div>
          ) : (
            <div className="p-mb-5">
              <Table
                dataReady={dataReady}
                tableHeaders={TableHeaders}
                tableData={TableData}
                onSelectionChange={
                  !isAllSelected ? (maintenance) => setSelectedMaintenance(maintenance) : null
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
            tableHeaders={TableHeaders}
            tableData={TableData}
            onSelectionChange={
              !isAllSelected ? (maintenance) => setSelectedMaintenance(maintenance) : null
            }
            hasSelection={!isAllSelected}
            tab={tab}
          />
          {selectedMaintenance && (
            <MaintenanceDetails
              maintenance={selectedMaintenance}
              selectedClient={selectedClient}
              setAllRequests={setAllRequests}
              setSelectedMaintenance={setSelectedMaintenance}
              disableButtons={disableButtons}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default CommonMaintenancePanel;
