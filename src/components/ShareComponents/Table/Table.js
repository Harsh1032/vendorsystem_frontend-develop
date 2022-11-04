import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import moment from "moment";
import { Button } from "primereact/button";
import useWindowSize from "../helpers/useWindowSize";
import * as Constants from "../../../constants";
import LoadingAnimation from "../LoadingAnimation";
import { isMobileDevice, capitalize, validateEmail } from "../../../helpers/helperFunctions";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { useHistory } from "react-router-dom";
import "./Table.scss";
import "../../../styles/ShareComponents/datePicker.scss";

/**
 * Share table component with pagination and selection controls
 *
 * @param {Array} tableHeaders table column header title array as format [{header:"", colFilter: {filterField:"", filterOptions: {filterType:"", dateFormat:"", filterElement:object}}}] filterType have options: "dropdown", "date", "dateRange" and "custom"
 * @param {Array} tableData Table data array as format [{id:"", dataPoint: {} ,cells:[]}]
 * @param {Boolean} hasSelection Table have selection control or not
 * @param {Boolean} multipleSelection Table has multiple selection (you can select multiple rows)
 * @param {Function} onSelectionChange Call back on selection changed, the param will be {dataPoint}
 * @param {Object} pagination Table pagination params as format {totalPages:10, currentPage:1, onPageChangeHandle:callback}
 * @param {Boolean} dataReady Determine if the table will display spinner or not, default to true
 */
const Table = ({
  tableHeaders = [],
  tableData = [],
  onSelectionChange,
  hasSelection = false,
  multipleSelection = false,
  dataReady = true,
  hasExport = false,
  rows,
  globalSearch = true,
  disableMobileDetail = false,
  tab = 0,
  persistPage = true,
  timeOrder = true,
}) => {
  const [first, setFirst] = useState(0);
  const [active, setActive] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(multipleSelection ? [] : null);
  const selectionMode = hasSelection ? (multipleSelection ? "multiple" : "single") : null;
  const [filters, setFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState(null);
  const dispatch = useDispatch();
  const dtRef = useRef(null);
  const wrapperRef = useRef(null);
  const { t } = useTranslation();
  const size = useWindowSize();
  let isMobile = size.width <= Constants.MOBILE_BREAKPOINT;
  let tableFilters = tableHeaders.map((item) => item.colFilter);

  const history = useHistory();

  const onPageHandler = (e) => {
    if (active || e.first !== 0) {
      setFirst(e.first);
      if ("URLSearchParams" in window && persistPage) {
        let searchParams = new URLSearchParams(window.location.search);
        if (tab === 0) searchParams.set("page1", e.first);
        else searchParams.set("page2", e.first);
        let newRelativePathQuery = window.location.pathname + "?" + searchParams.toString();
        history.replace(newRelativePathQuery);
      }
    }
    setActive(true);
  };

  useEffect(() => {
    if ("URLSearchParams" in window && persistPage) {
      const urlParams = new URLSearchParams(window.location.search);
      const myParam = tab === 0 ? urlParams.get("page1") : urlParams.get("page2");
      if (myParam) setFirst(parseInt(myParam));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  //get table wrapper inital height and set as min height to avoid jumping
  useEffect(() => {
    if (!isMobileDevice()) {
      let initialHeight = wrapperRef.current.clientHeight;
      wrapperRef.current.style.minHeight = `${initialHeight}px`;
    }
  }, [dataReady]);

  //Reset state every time table is rerendered (via dataReady)
  useEffect(() => {
    setSelectedRowData(multipleSelection ? [] : null);
  }, [dataReady, multipleSelection]);

  const onSelectHandle = (event) => {
    setActive(true);
    setSelectedRowData(event.value);
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "table_detail" });

    let dataPoint = null;
    if (!multipleSelection) {
      //Single select logic
      if (!!event.value) {
        dataPoint = event.value.dataPoint;
      }
    } else {
      //Multiple Select logic
      dataPoint = event.value.map((rowData) => rowData.dataPoint);
    }
    onSelectionChange(dataPoint);
  };

  const bodyTemplate = (data, props) => {
    return (
      <React.Fragment>
        <span className="p-column-title">{props.header}</span>
        <span className="p-body-template">{data.cells[props.field]}</span>
      </React.Fragment>
    );
  };

  const filterFunction = (colIndex) => {
    let filterOption = tableFilters[colIndex]?.filterOptions;
    switch (filterOption?.filterAs) {
      case "dateRange":
        return (value, filter) => {
          let val = moment(value);
          let startDate = !!filter[0] ? moment(filter[0]) : undefined;
          let endDate = !!filter[1] ? moment(filter[1]) : undefined;
          return val.isBetween(startDate, endDate, undefined, "[]");
        };
      default:
        return filterOption?.filterFunction;
    }
  };

  const filterElement = (colIndex) => {
    let filterOption = tableFilters[colIndex]?.filterOptions;
    switch (filterOption?.filterAs) {
      case "dropdown":
        return SelectFilterElement(colIndex);
      case "date":
        return DateFilterElement(colIndex, filterOption.dateFormat);
      case "dateRange":
        return DateFilterElement(colIndex, filterOption.dateFormat, true);
      default:
        return tableFilters[colIndex]?.filterOptions?.filterElement;
    }
  };

  const monthNavigatorTemplate = (e) => {
    return (
      <Dropdown
        panelClassName="table-cal-dropdown"
        className="p-mx-1 w-auto"
        value={e.value}
        options={e.options}
        onChange={(event) => e.onChange(event.originalEvent, event.value)}
        style={{ lineHeight: 1 }}
      />
    );
  };

  const yearNavigatorTemplate = (e) => {
    return (
      <Dropdown
        panelClassName="table-cal-dropdown"
        className="p-mx-1 w-auto"
        value={e.value}
        options={e.options}
        onChange={(event) => e.onChange(event.originalEvent, event.value)}
        style={{ lineHeight: 1 }}
      />
    );
  };

  const DateFilterElement = (colIndex, dateFormat, isRange = false) => {
    return (
      <div className="custom-datepicker">
        <Calendar
          panelClassName="dropdown-content-cal"
          className="w-100"
          placeholder={t("general.filter_placeholder", { name: tableHeaders[colIndex].header })}
          value={filters[tableFilters[colIndex]?.field]}
          showButtonBar
          showIcon
          monthNavigator
          yearNavigator
          monthNavigatorTemplate={monthNavigatorTemplate}
          yearNavigatorTemplate={yearNavigatorTemplate}
          yearRange="1980:2099"
          selectionMode={isRange ? "range" : "single"}
          onChange={(e) => {
            let selectedDate = e.target.value;
            let ColFilterField = tableFilters[colIndex].field;
            selectedDate = isRange
              ? selectedDate
              : selectedDate && moment(selectedDate).format(dateFormat);
            setFilters({ ...filters, [ColFilterField]: selectedDate });
            dtRef.current.filter(selectedDate, colIndex, isRange ? "custom" : "equals");
          }}
        />
      </div>
    );
  };

  const SelectFilterElement = (colIndex) => {
    let colFilterOption = tableFilters[colIndex]?.filterOptions;
    let colFilterField = tableFilters[colIndex]?.field;

    let valueArray = [];
    tableData.forEach((rowData) => {
      let value = rowData.dataPoint[colFilterField];
      if (valueArray.indexOf(value) < 0) valueArray.push(value);
    });
    let options = valueArray.map((value) => {
      return { name: value };
    });

    let customItemTemplate = (option) => {
      if (option) {
        return !!colFilterOption?.itemTemplate
          ? colFilterOption.itemTemplate(option.name)
          : validateEmail(option.name)
          ? option.name
          : capitalize(option.name);
      }
    };
    let customValueTemplate = (option, props) => {
      if (option)
        return !!colFilterOption?.valueTemplate
          ? colFilterOption.valueTemplate(option.name)
          : validateEmail(option.name)
          ? option.name
          : capitalize(option.name);

      return <span>{props.placeholder}</span>;
    };

    return (
      <Dropdown
        placeholder={t("general.filter_placeholder", { name: tableHeaders[colIndex].header })}
        panelClassName="table-filter-dropdown"
        options={options}
        optionLabel="name"
        className="p-column-filter"
        value={filters[colFilterField]}
        itemTemplate={customItemTemplate}
        valueTemplate={customValueTemplate}
        showClear
        filter={options.length > 10}
        filterBy="name"
        onChange={(e) => {
          let filterValue = e.target.value;
          setFilters({ ...filters, [colFilterField]: filterValue });
          dtRef.current.filter(filterValue?.name, colIndex, "equals");
        }}
      />
    );
  };

  let dynamicColumns = tableHeaders.map((col, colIndex) => {
    //TODO remove this logic after finish all table refactoring
    let colName = typeof col === "string" ? col : col.header;

    return (
      <Column
        key={colIndex}
        field={`${colIndex}`}
        header={colName}
        body={bodyTemplate}
        filter={!!tableFilters[colIndex]}
        filterPlaceholder={t("general.filter_placeholder", { name: colName })}
        filterElement={filterElement(colIndex)}
        filterFunction={filterFunction(colIndex)}
        filterField={`${colIndex}`}
        filterType={"search"}
        filterMatchMode={
          tableFilters[colIndex]?.filterOptions?.filterFunction ? "custom" : "contains"
        }
        style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
      />
    );
  });

  let list =
    tableData &&
    tableData.map((item) => {
      let data = tableFilters.map((filter, colIndex) => {
        if (!!tableFilters[colIndex]) return item.dataPoint[filter.field];
        else return item.cells[colIndex];
      });

      return {
        id: item.id,
        dataPoint: item.dataPoint,
        cells: item.cells,
        ...data,
      };
    });
  if (list.length !== 0) {
    if (list[0].dataPoint.date_created && timeOrder) {
      list.sort(
        (data1, data2) =>
          new Date(data1.dataPoint.date_created).getTime() -
          new Date(data2.dataPoint.date_created).getTime()
      );
    }
  }

  const exportCSV = () => {
    dtRef.current.exportCSV();
  };

  const tableToolsHeader = (
    <React.Fragment>
      {globalSearch && (
        <div className="table-tools-header p-fluid">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              type="search"
              onInput={(e) => setGlobalFilter(e.target.value)}
              placeholder={t("general.table_global_filter_placeholder")}
              tooltip={t("general.table_global_filter_tooltip")}
              tooltipOptions={{ position: "top" }}
            />
          </span>
          {hasExport && (
            <div className="p-ml-3 table-export-btn" style={{ textAlign: "right" }}>
              <Button type="button" icon="pi pi-external-link" label="Export" onClick={exportCSV} />
            </div>
          )}
        </div>
      )}
    </React.Fragment>
  );

  return (
    <div
      className={`table-wrapper ${!globalSearch && !hasExport ? "no-header" : ""}`}
      ref={wrapperRef}
    >
      {dataReady || (!dataReady && !isMobile) ? (
        <DataTable
          first={first}
          onPage={onPageHandler}
          ref={dtRef}
          className="shadow"
          header={tableToolsHeader}
          globalFilter={globalFilter}
          value={list}
          selection={selectedRowData}
          selectionMode={selectionMode}
          dataKey="id"
          metaKeySelection={false}
          loading={!dataReady}
          rowHover
          paginator
          rows={rows ? rows : isMobile ? 5 : 10}
          pageLinkSize={isMobile ? 3 : 5}
          rowClassName={(data) => {
            return { [selectionMode]: true };
          }}
          onSelectionChange={onSelectHandle}
          emptyMessage={t("general.table_no_data_match")}
          resizableColumns
          columnResizeMode="fit"
        >
          {selectionMode ? (
            <Column selectionMode={selectionMode} headerStyle={{ width: "3rem" }} />
          ) : null}
          {dynamicColumns}
          {isMobile && !disableMobileDetail && (
            <Column
              className="detailview-indicator"
              body={() => {
                return (
                  <Button
                    label={t("general.mobile_table_detail_indicator")}
                    icon="pi pi-chevron-right"
                    className="detailview-button"
                    iconPos="right"
                  />
                );
              }}
            />
          )}
        </DataTable>
      ) : (
        <LoadingAnimation />
      )}
    </div>
  );
};

export default Table;
