import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import * as Constants from "../../../constants";
import { capitalize } from "../../../helpers/helperFunctions";
import { Table } from "../../ShareComponents/Table";
import RepairDetails from "./RepairDetails";
import GeneralBadge from "../../ShareComponents/GeneralBadge";
import DateBadge from "../../ShareComponents/helpers/DateBadge";

const CommonRepairsPanel = ({
  category,
  repairs,
  selectedRepair,
  setSelectedRepair,
  setAllRequests,
  selectedClient,
  dataReady,
  tab,
  disableButtons,
  isAllSelected,
}) => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  let TableHeaders = [];
  let TableData = [];

  if (!repairs) return null;

  if (isAllSelected) {
    TableHeaders = [
      { header: t("general.id"), colFilter: { field: "client_request_work_order" } },
      { header: t("general.client_name"), colFilter: { field: "client_name" } },
      {
        header: t("general.status"),
        colFilter: { field: "status", filterOptions: { filterAs: "dropdown" } },
      },
      { header: t("general.created_by"), colFilter: { field: "created_by" } },
      {
        header: t("general.date_created"),
        colFilter: {
          field: "date_created",
          filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
        },
      },
    ];

    TableData = repairs.map((repair) => {
      return {
        id: repair.repair_id,
        dataPoint: repair,
        cells: [
          repair.client_request_work_order
            ? repair.client_request_work_order
            : t("general.not_applicable"),
          repair.client_name ? repair.client_name : t("general.not_applicable"),
          capitalize(repair.status),
          repair.created_by ? repair.created_by : t("general.not_applicable"),
          moment(repair.date_created).isValid()
            ? moment(repair.date_created).format("YYYY-MM-DD")
            : t("general.not_applicable"),
        ],
      };
    });
  } else {
    if (category === "inProgress") {
      TableHeaders = [
        { header: t("general.id"), colFilter: { field: "work_order" } },
        { header: t("general.vin"), colFilter: { field: "VIN" } },
        {
          header: t("general.location"),
          colFilter: { field: "current_location", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("repairRequestPanel.urgent_repair_button"),
          colFilter: { field: "is_urgent", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("general.status"),
          colFilter: { field: "status", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("general.date_created"),
          colFilter: {
            field: "date_created",
            filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
          },
        },
        {
          header: t("repairRequestPanel.requested_delivery_date_label"),
          colFilter: {
            field: "requested_delivery_date",
            filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
          },
        },
      ];

      TableData = repairs.map((repair) => {
        return {
          id: repair.repair_id,
          dataPoint: repair,
          cells: [
            repair.work_order,
            repair.VIN,
            repair.current_location,
            <GeneralBadge
              data={repair.is_urgent}
              colorTheme={
                repair.is_urgent.toLowerCase() === "yes" ? "badge-danger" : "badge-secondary"
              }
            />,
            capitalize(repair.status),
            ...(moment(repair.date_created).isValid()
              ? [moment(repair.date_created).format("YYYY-MM-DD")]
              : [t("general.not_applicable")]),
            ...(moment(repair.requested_delivery_date).isValid()
              ? [
                  <DateBadge
                    currentDate={moment(repair.requested_delivery_date).format("YYYY-MM-DD")}
                    dateRange={8}
                  />,
                ]
              : [t("general.not_applicable")]),
          ],
        };
      });
    } else if (category === "completed") {
      TableHeaders = [
        { header: t("general.id"), colFilter: { field: "work_order" } },
        { header: t("general.vin"), colFilter: { field: "VIN" } },
        {
          header: t("general.location"),
          colFilter: { field: "current_location", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("general.status"),
          colFilter: { field: "status", filterOptions: { filterAs: "dropdown" } },
        },
        {
          header: t("repairsPanelIndex.date_completed"),
          colFilter: {
            field: "date_completed",
            filterOptions: { filterAs: "dateRange", dateFormat: "YYYY-MM-DD" },
          },
        },
      ];

      TableData = repairs.map((repair) => {
        return {
          id: repair.repair_id,
          dataPoint: repair,
          cells: [
            repair.work_order,
            repair.VIN,
            repair.current_location,
            capitalize(repair.status),
            ...(moment(repair.date_completed).isValid()
              ? [moment(repair.date_completed).format("YYYY-MM-DD")]
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
          {selectedRepair ? (
            <div className="p-mb-5">
              <RepairDetails
                repair={selectedRepair}
                setSelectedRepair={setSelectedRepair}
                setAllRequests={setAllRequests}
                selectedClient={selectedClient}
                disableButtons={disableButtons}
              />
            </div>
          ) : (
            <div className="p-mb-5">
              <Table
                dataReady={dataReady}
                tableHeaders={TableHeaders}
                tableData={TableData}
                onSelectionChange={!isAllSelected ? (repair) => setSelectedRepair(repair) : null}
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
            onSelectionChange={!isAllSelected ? (repair) => setSelectedRepair(repair) : null}
            hasSelection={!isAllSelected}
            tab={tab}
          />
          {selectedRepair && !Array.isArray(selectedRepair) && (
            <RepairDetails
              repair={selectedRepair}
              setSelectedRepair={setSelectedRepair}
              setAllRequests={setAllRequests}
              selectedClient={selectedClient}
              disableButtons={disableButtons}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default CommonRepairsPanel;
