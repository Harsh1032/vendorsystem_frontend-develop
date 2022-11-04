import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { useMediaQuery } from "react-responsive";
import * as Constants from "../../constants";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";
import CustomInputNumber from "./CustomInputNumber";
import CustomInputText from "./CustomInputText";
import FormDropdown from "./Forms/FormDropdown";
import "./Table/Table.scss";
import "../../styles/helpers/button2.scss";
import "../../styles/ShareComponents/BatchCostsForm.scss";

function BatchCostsForm({
  laborCosts,
  setLaborCosts,
  partsCosts,
  setPartsCosts,
  dialogStatus,
  setDialogStatus,
  issues,
  maintenanceID,
  currencies,
  onClose,
}) {
  const [currenciesOptions, setCurrenciesOptions] = useState([]);
  const [isSubmissionReady, setIsSubmissionReady] = useState(false);
  const [issuesOptions, setIssuesOptions] = useState([]);

  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });

  const [laborCostsColumns, setLaborCostsColumns] = useState([
    { field: "base_hourly_rate", header: "Base Hourly Rate", type: "number" },
    { field: "total_base_hours", header: "Total Base Hours", type: "number" },
    { field: "overtime_rate", header: "Overtime Rate", type: "number" },
    { field: "total_overtime_hours", header: "Total Overtime Hours", type: "number" },
    { field: "taxes", header: "Taxes", type: "number" },
    { field: "currency", header: "Currency", type: "select" },
    { field: "total_cost", header: "Total Cost", type: "number" },
    { field: "action", header: "Action" },
  ]);

  const [partsCostsColumns, setPartsCostsColumns] = useState([
    { field: "part_number", header: "Part Number", type: "text" },
    { field: "part_name", header: "Part Name", type: "text" },
    { field: "quantity", header: "Quantity", type: "integer" },
    { field: "price", header: "Price", type: "number" },
    { field: "taxes", header: "Taxes", type: "number" },
    { field: "currency", header: "Currency", type: "select" },
    { field: "total_cost", header: "Total Cost", type: "number" },
    { field: "action", header: "Action" },
  ]);

  useEffect(() => {
    const currentLaborCostFields = laborCostsColumns.map((column) => column.field);
    if (issues && !currentLaborCostFields.includes("issue")) {
      const issuesList = issues.map((issue) => {
        return { code: issue.issue_id, name: issue.custom_id };
      });

      setIssuesOptions(issuesList);

      setLaborCostsColumns((prev) => {
        const issueSelectColumn = { field: "issue", header: "Issue", type: "select" };
        return [issueSelectColumn, ...prev];
      });
      setPartsCostsColumns((prev) => {
        const issueSelectColumn = { field: "issue", header: "Issue", type: "select" };
        return [issueSelectColumn, ...prev];
      });
    }

    const currenciesList = currencies.map((currency) => {
      return { code: currency.code, name: currency.name };
    });

    setCurrenciesOptions(currenciesList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues]);

  const checkSubmissionValid = useCallback(() => {
    if (laborCosts.length === 0 && partsCosts.length === 0) {
      return setIsSubmissionReady(false);
    }

    const costs = [laborCosts, partsCosts];
    for (let costGroup of costs) {
      for (let cost of costGroup) {
        for (let field in cost) {
          if (!cost[field]) {
            return setIsSubmissionReady(false);
          }
        }
      }
    }

    return setIsSubmissionReady(true);
  }, [laborCosts, partsCosts]);

  useEffect(() => {
    checkSubmissionValid();
  }, [laborCosts, partsCosts, checkSubmissionValid]);

  const { t } = useTranslation();

  const valueChangeHandler = (val, tableName, rowData, field) => {
    const costUpdateHandler = (prev) => {
      let selectedIndex = null;
      for (let i = 0; i < prev.length; i++) {
        if (prev[i].index === rowData.index) {
          selectedIndex = i;
          prev[i][field] = val;
        }
      }

      // update total cost
      if (tableName === "laborCosts") {
        const base_hourly_rate = prev[selectedIndex].base_hourly_rate
          ? prev[selectedIndex].base_hourly_rate
          : 0;
        const total_base_hours = prev[selectedIndex].total_base_hours
          ? prev[selectedIndex].total_base_hours
          : 0;
        const overtime_rate = prev[selectedIndex].overtime_rate
          ? prev[selectedIndex].overtime_rate
          : 0;
        const total_overtime_hours = prev[selectedIndex].total_overtime_hours
          ? prev[selectedIndex].total_overtime_hours
          : 0;
        const taxes = prev[selectedIndex].taxes ? prev[selectedIndex].taxes : 0;
        let tempTotalCost =
          base_hourly_rate * total_base_hours + overtime_rate * total_overtime_hours + taxes;

        if (!tempTotalCost) {
          tempTotalCost = undefined;
        }
        prev[selectedIndex].total_cost = tempTotalCost;
      } else if (tableName === "partsCosts") {
        const quantity = prev[selectedIndex].quantity ? prev[selectedIndex].quantity : 0;
        const price = prev[selectedIndex].price ? prev[selectedIndex].price : 0;
        const taxes = prev[selectedIndex].taxes ? prev[selectedIndex].taxes : 0;
        let tempTotalCost = quantity * price + taxes;

        if (!tempTotalCost) {
          tempTotalCost = undefined;
        }
        prev[selectedIndex].total_cost = tempTotalCost;
      }

      return [...prev];
    };

    if (tableName === "laborCosts") {
      setLaborCosts(costUpdateHandler);
    } else if (tableName === "partsCosts") {
      setPartsCosts(costUpdateHandler);
    }
  };

  const bodyTemplate = (tableName, rowData, field, header, type) => {
    const costDeleteHandler = (prev) => {
      const res = prev.filter((cost) => {
        if (cost.index === rowData.index) {
          return false;
        }
        return true;
      });
      return res;
    };

    if (field === "action") {
      return (
        <Button
          icon="pi pi-times"
          className={`p-button-rounded p-button-danger p-button-text ${isMobile && "pull-right"}`}
          onClick={() => {
            if (tableName === "laborCosts") {
              setLaborCosts(costDeleteHandler);
            } else if (tableName === "partsCosts") {
              setPartsCosts(costDeleteHandler);
            }
          }}
        />
      );
    } else {
      if (type === "number") {
        return (
          <>
            {isMobile && <h5>{header}</h5>}
            <CustomInputNumber
              value={rowData[field]}
              onChange={(v) => valueChangeHandler(v, tableName, rowData, field)}
              className={`w-100 ${!rowData[field] && "error"}`}
              mode="decimal"
              minFractionDigits={2}
              maxFractionDigits={2}
              max={2147483646}
            />
          </>
        );
      } else if (type === "integer") {
        return (
          <>
            {isMobile && <h5>{header}</h5>}
            <CustomInputNumber
              value={rowData[field]}
              onChange={(v) => valueChangeHandler(v, tableName, rowData, field)}
              className={`w-100 ${!rowData[field] && "error"}`}
              max={2147483646}
            />
          </>
        );
      } else if (type === "text") {
        return (
          <>
            {isMobile && <h5>{header}</h5>}
            <CustomInputText
              type={"text"}
              classnames={`${!rowData[field] && "error"}`}
              value={rowData[field] ? rowData[field] : ""}
              onChange={(v) => valueChangeHandler(v, tableName, rowData, field)}
            />
          </>
        );
      } else if (type === "select") {
        let defaultValue = null;
        if (field === "currency") {
          defaultValue = currenciesOptions.filter((option) => option.code === rowData[field])[0];
        } else if (field === "issue") {
          defaultValue = issuesOptions.filter((option) => option.code === rowData[field])[0];
        }
        return (
          <>
            {isMobile && <h5>{header}</h5>}
            <div className={`w-100 dropdown ${!rowData[field] && "error"}`}>
              {field === "currency" && (
                <FormDropdown
                  key={`${header}-${rowData.index}`}
                  defaultValue={defaultValue}
                  onChange={(v) => valueChangeHandler(v, tableName, rowData, field)}
                  options={currenciesOptions}
                  loading={!currenciesOptions}
                  disabled={!currenciesOptions}
                  dataReady={currenciesOptions}
                  plain_dropdown
                  reset={"disabled"}
                />
              )}
              {field === "issue" && (
                <FormDropdown
                  key={`${header}-${rowData.index}`}
                  defaultValue={defaultValue}
                  onChange={(v) => valueChangeHandler(v, tableName, rowData, field)}
                  options={issuesOptions}
                  loading={!issuesOptions}
                  disabled={!issuesOptions}
                  dataReady={issuesOptions}
                  plain_dropdown
                  reset={"disabled"}
                />
              )}
            </div>
          </>
        );
      }
    }
  };

  const onHide = () => {
    setLaborCosts([]);
    setPartsCosts([]);
    setDialogStatus(false);
    onClose();
  };

  const renderFooter = () => {
    return (
      <Button
        label={t("general.save")}
        icon="pi pi-check"
        className="p-button-success p-mt-4"
        disabled={!isSubmissionReady}
        onClick={() => {
          setDialogStatus(false);
        }}
      />
    );
  };

  const addLaborCosts = () => {
    setLaborCosts((prev) => {
      let tempLaborCost = {
        index: Math.random().toString(36).slice(2),
        base_hourly_rate: undefined,
        total_base_hours: undefined,
        overtime_rate: undefined,
        total_overtime_hours: undefined,
        taxes: undefined,
        currency: undefined,
        total_cost: undefined,
      };

      if (issues) {
        tempLaborCost["issue"] = undefined;
      }

      if (maintenanceID) {
        tempLaborCost["maintenance"] = maintenanceID;
      }

      return [...prev, tempLaborCost];
    });
  };

  const addPartsCosts = () => {
    setPartsCosts((prev) => {
      let tempPartsCost = {
        index: Math.random().toString(36).slice(2),
        part_number: undefined,
        part_name: undefined,
        quantity: undefined,
        price: undefined,
        taxes: undefined,
        currency: undefined,
        total_cost: undefined,
      };

      if (issues) {
        tempPartsCost["issue"] = undefined;
      }

      if (maintenanceID) {
        tempPartsCost["maintenance"] = maintenanceID;
      }

      return [...prev, tempPartsCost];
    });
  };

  return (
    <Dialog
      className="custom-main-dialog"
      header={t("costs.invoice_data_confirm")}
      visible={dialogStatus}
      footer={renderFooter}
      onHide={onHide}
      style={{ width: "90vw" }}
      breakpoints={{ "1280px": "92vw", "960px": "95vw", "768px": "80vw" }}
    >
      <h4>{t("costs.labor_costs")}</h4>
      <DataTable
        value={laborCosts}
        editMode="cell"
        className="darkTable costsBatchTableForm"
        responsiveLayout="scroll"
      >
        {laborCostsColumns.map(({ field, header, type }) => {
          return (
            <Column
              key={field}
              field={field}
              header={header}
              body={(rowData) => bodyTemplate("laborCosts", rowData, field, header, type)}
            />
          );
        })}
      </DataTable>
      <div className="btn-2 p-mt-3 p-justify-end .p-formgroup-inline" style={{ display: "flex" }}>
        <Button
          label={t("costs.add_labor_cost")}
          icon="pi pi-plus-circle"
          onClick={addLaborCosts}
        />
      </div>
      <br />

      <h4>{t("costs.parts_costs")}</h4>
      <DataTable
        value={partsCosts}
        editMode="cell"
        className="darkTable costsBatchTableForm"
        responsiveLayout="scroll"
      >
        {partsCostsColumns.map(({ field, header, type }) => {
          return (
            <Column
              key={field}
              field={field}
              header={header}
              body={(rowData) => bodyTemplate("partsCosts", rowData, field, header, type)}
            />
          );
        })}
      </DataTable>
      <div className="btn-2 p-mt-3 p-justify-end" style={{ display: "flex" }}>
        <Button
          label={t("costs.add_parts_cost")}
          icon="pi pi-plus-circle"
          onClick={addPartsCosts}
        />
      </div>
    </Dialog>
  );
}

export default BatchCostsForm;
