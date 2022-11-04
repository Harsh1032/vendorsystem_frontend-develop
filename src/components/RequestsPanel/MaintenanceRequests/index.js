import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import * as Constants from "../../../constants";
import { TabView, TabPanel } from "primereact/tabview";
import { faOilCan } from "@fortawesome/free-solid-svg-icons";
import PanelHeader from "../../ShareComponents/helpers/PanelHeader";
import QuickAccessTabs from "../../ShareComponents/QuickAccessTabs";
import CommonMaintenancePanel from "./CommonMaintenancePanel";
import { persistSetTab } from "../../../helpers/helperFunctions";
import { persistGetTab } from "../../../helpers/helperFunctions";
import { sendGetRequests } from "../../../helpers/HttpRequestHelper";
import { getAuthHeader } from "../../../helpers/Authorization";
import CustomFilterDropdown from "../../ShareComponents/CustomFilterDropdown";
import GeneralRadio from "../../ShareComponents/GeneralRadio";
import useWindowSize from "../../ShareComponents/helpers/useWindowSize";
import Breadcrumbs from "../../ShareComponents/Breadcrumbs";
import "../../../styles/ShareComponents/Table/table.scss";
import "../../../styles/ShareComponents/TabStyles/subTab.scss";

const MaintenanceRequests = () => {
  const { userInfo } = useSelector((state) => state.apiCallData);
  const clients = userInfo.aux_data.client_names;
  const clientOptions = clients.map((client) => ({ name: client, code: client }));
  const [dataReady, setDataReady] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [pendingMaintenance, setPendingMaintenance] = useState([]);
  const [rejectedMaintenance, setRejectedMaintenance] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  const { width } = useWindowSize("layout-content-inner");
  const { t } = useTranslation();
  const history = useHistory();

  useEffect(() => {
    setSelectedMaintenance(null);
  }, [activeIndex]);

  useEffect(() => {
    persistGetTab(setActiveIndex);
  }, []);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (!!!dataReady) {
      if (isAllSelected) {
        const callback = (result, status) => {
          if (status === "fulfilled") {
            let allRequests = result.data;
            setAllRequests(allRequests);
            setDataReady(true);
          }
        };

        const errorHandler = () => {
          setDataReady(true);
        };

        const requestURL = `${Constants.ENDPOINT_PREFIX}/api/v1/Maintenance/List/Quotes`;

        sendGetRequests(
          [requestURL],
          {
            ...getAuthHeader(),
            cancelToken: cancelTokenSource.token,
          },
          [callback],
          errorHandler
        );
      } else {
        const callback = (result, status) => {
          if (status === "fulfilled") {
            let validStatus = ["waiting for vendor", "awaiting approval", "cancelled", "denied"];
            let data = result.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));

            setAllRequests(data);
            setDataReady(true);
          }
        };

        const errorHandler = () => {
          setDataReady(true);
        };
        const requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Maintenance/Get/${selectedClient}`;

        sendGetRequests(
          [requestURL],
          {
            ...getAuthHeader(),
            cancelToken: cancelTokenSource.token,
          },
          [callback],
          errorHandler
        );
      }
    }
    return () => {
      //Doing clean up work, cancel the asynchronous api call
      cancelTokenSource.cancel("cancel the asynchronous api call from custom hook");
    };
  }, [dataReady, isAllSelected, selectedClient]);

  useEffect(() => {
    const pendingMaintenance = [];
    const rejectedMaintenance = [];

    if (isAllSelected) {
      for (let i in allRequests) {
        if (["pending", "sent", "approved"].includes(allRequests[i].status.toLowerCase())) {
          pendingMaintenance.push(allRequests[i]);
        } else if (["rejected"].includes(allRequests[i].status.toLowerCase())) {
          rejectedMaintenance.push(allRequests[i]);
        }
      }
    } else {
      for (let i in allRequests) {
        if (
          ["waiting for vendor", "awaiting approval"].includes(
            allRequests[i].status.toLowerCase()
          ) &&
          allRequests[i].quotes.length &&
          ["pending", "sent"].includes(allRequests[i].quotes[0].status)
        ) {
          pendingMaintenance.push(allRequests[i]);
        } else if (["cancelled", "denied"].includes(allRequests[i].status?.toLowerCase())) {
          rejectedMaintenance.push(allRequests[i]);
        }
      }
    }

    setPendingMaintenance(pendingMaintenance);
    setRejectedMaintenance(rejectedMaintenance);
  }, [allRequests, isAllSelected]);

  const requestsOnChange = () => {
    setDataReady(false);
    setAllRequests([]);
    setActiveIndex(0);
  };

  const clientsOnChange = (e) => {
    requestsOnChange();
    setSelectedClient(e.value.code);
  };

  return (
    <div>
      {isMobile ? (
        <React.Fragment>
          <QuickAccessTabs
            tabs={["Repair", "Maintenance", "Asset Request", "Disposal", "Transfer"]}
            activeTab={"Maintenance"}
            icon={faOilCan}
            urls={[
              "/requests",
              "/requests/maintenance",
              "/requests/asset-request",
              "/requests/disposal",
              "/requests/transfer",
            ]}
            scrollable={width < 420}
          />
          <Breadcrumbs
            module={t("navigationItems.requests")}
            tabLabel={t("navigationItems.orders_maintenance")}
            tabIcon={faOilCan}
            orderID={selectedMaintenance ? selectedMaintenance.work_order : null}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <PanelHeader
            icon={faOilCan}
            text={t("maintenancePanelIndex.page_title")}
            mobileBg={isMobile}
          />
          <QuickAccessTabs
            tabs={["Repair", "Maintenance", "Asset Request", "Disposal", "Transfer"]}
            activeTab={"Maintenance"}
            urls={[
              "/requests",
              "/requests/maintenance",
              "/requests/asset-request",
              "/requests/disposal",
              "/requests/transfer",
            ]}
            scrollable={width < 786}
          />
        </React.Fragment>
      )}
      <div className="p-field mt-4 mb-4">
        <GeneralRadio
          labelStyle={{ display: "none" }}
          customBtnStyle={{ color: "white", fontWeight: 600 }}
          labels={["", t("general.show_all_quotes"), t("general.show_requests_by_client")]}
          value={isAllSelected}
          name="isAllSelected"
          onChange={setIsAllSelected}
          onCallBack={requestsOnChange}
        />
      </div>
      {!isAllSelected && (
        <CustomFilterDropdown
          className={`mt-3 ${isMobile ? "w-100" : "w-25"}`}
          options={clientOptions}
          value={selectedClient}
          onChange={clientsOnChange}
        />
      )}
      <TabView
        className="darkSubTab darkTable"
        activeIndex={activeIndex}
        onTabChange={(e) => {
          persistSetTab(e, history);
          setActiveIndex(e.index);
        }}
      >
        <TabPanel header={t("general.pending_approval").toUpperCase()}>
          <CommonMaintenancePanel
            category="pending"
            maintenances={pendingMaintenance}
            setAllRequests={setAllRequests}
            selectedClient={selectedClient}
            selectedMaintenance={selectedMaintenance}
            setSelectedMaintenance={setSelectedMaintenance}
            dataReady={dataReady}
            tab={activeIndex}
            isAllSelected={isAllSelected}
          />
        </TabPanel>
        <TabPanel header={t("general.rejected").toUpperCase()}>
          <CommonMaintenancePanel
            category="rejected"
            maintenances={rejectedMaintenance}
            selectedMaintenance={selectedMaintenance}
            setSelectedMaintenance={setSelectedMaintenance}
            dataReady={dataReady}
            tab={activeIndex}
            isAllSelected={isAllSelected}
            disableButtons
          />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default MaintenanceRequests;
