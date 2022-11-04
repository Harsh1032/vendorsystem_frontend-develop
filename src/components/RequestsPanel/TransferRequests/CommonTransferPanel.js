import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import * as Constants from "../../../constants";
import TransferDetails from "./TransferDetails";
import { Table } from "../../ShareComponents/Table";
import { capitalize } from "../../../helpers/helperFunctions";

const CommonTransferPanel = ({
  category,
  transfers,
  setAllRequests,
  selectedClient,
  dataReady,
  tab,
  selectedTransfer,
  setSelectedTransfer,
  disableButtons,
  isAllSelected,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  let TableHeaders = [];
  let TableData = [];

  if (!transfers) return null;

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

    TableData = transfers.map((transfer) => {
      return {
        id: transfer.asset_transfer_id,
        dataPoint: transfer,
        cells: [
          transfer.client_request_work_order
            ? transfer.client_request_work_order
            : t("general.not_applicable"),
          transfer.client_name ? transfer.client_name : t("general.not_applicable"),
          capitalize(transfer.status),
          transfer.created_by ? transfer.created_by : t("general.not_applicable"),
          moment(transfer.date_created).isValid()
            ? moment(transfer.date_created).format("YYYY-MM-DD")
            : t("general.not_applicable"),
        ],
      };
    });
  } else {
    TableHeaders = [
      { header: t("general.id"), colFilter: { field: "custom_id" } },
      { header: t("general.vin"), colFilter: { field: "VIN" } },
      {
        header: t("general.business_unit"),
        colFilter: { field: "business_unit", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.current_location"),
        colFilter: { field: "current_location", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.destination_location"),
        colFilter: { field: "destination_location", filterOptions: { filterAs: "dropdown" } },
      },
      {
        header: t("general.status"),
        colFilter: { field: "status", filterOptions: { filterAs: "dropdown" } },
      },
    ];

    TableData = transfers.map((transfer) => {
      return {
        id: transfer.asset_transfer_id,
        dataPoint: transfer,
        cells: [
          transfer.custom_id,
          transfer.VIN,
          transfer.business_unit,
          transfer.current_location,
          transfer.destination_location,
          capitalize(transfer.status),
        ],
      };
    });
  }

  return (
    <React.Fragment>
      {isMobile ? (
        <React.Fragment>
          {selectedTransfer ? (
            <div className="p-mb-5">
              <TransferDetails
                transfer={selectedTransfer}
                selectedClient={selectedClient}
                setAllRequests={setAllRequests}
                setSelectedTransfer={setSelectedTransfer}
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
                  !isAllSelected ? (transfer) => setSelectedTransfer(transfer) : null
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
            onSelectionChange={!isAllSelected ? (transfer) => setSelectedTransfer(transfer) : null}
            hasSelection={!isAllSelected}
            tab={tab}
          />
          {selectedTransfer && (
            <TransferDetails
              transfer={selectedTransfer}
              selectedClient={selectedClient}
              setAllRequests={setAllRequests}
              setSelectedTransfer={setSelectedTransfer}
              disableButtons={disableButtons}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default CommonTransferPanel;
