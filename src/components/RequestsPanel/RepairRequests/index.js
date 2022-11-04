import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import * as Constants from "../../../constants";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendGetRequests } from "../../../helpers/HttpRequestHelper";
import { TabView, TabPanel } from "primereact/tabview";
import { faWrench } from "@fortawesome/free-solid-svg-icons";
import PanelHeader from "../../ShareComponents/helpers/PanelHeader";
import QuickAccessTabs from "../../ShareComponents/QuickAccessTabs";
import CommonRepairsPanel from "./CommonRepairsPanel";
import { persistSetTab } from "../../../helpers/helperFunctions";
import { persistGetTab } from "../../../helpers/helperFunctions";
import CustomFilterDropdown from "../../ShareComponents/CustomFilterDropdown";
import GeneralRadio from "../../ShareComponents/GeneralRadio";
import useWindowSize from "../../ShareComponents/helpers/useWindowSize";
import Breadcrumbs from "../../ShareComponents/Breadcrumbs";
import "../../../styles/ShareComponents/Table/table.scss";
import "../../../styles/ShareComponents/TabStyles/subTab.scss";

const RepairRequests = () => {
  const { userInfo } = useSelector((state) => state.apiCallData);
  const clients = userInfo.aux_data.client_names;
  const clientOptions = clients.map((client) => ({ name: client, code: client }));
  const [dataReady, setDataReady] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [pendingRepairRequests, setPendingRepairRequests] = useState([]);
  const [rejectedRepairRequests, setRejectedRepairRequests] = useState([]);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  const { width } = useWindowSize("layout-content-inner");
  const { t } = useTranslation();
  const history = useHistory();

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

        const requestURL = `${Constants.ENDPOINT_PREFIX}/api/v1/Repair/List/Quotes`;

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
        const requestURL = `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Repair/Get/${selectedClient}`;

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
    let pending = [];
    let rejected = [];

    if (isAllSelected) {
      for (let i in allRequests) {
        if (["pending", "sent", "approved"].includes(allRequests[i].status.toLowerCase())) {
          pending.push(allRequests[i]);
        } else if (["rejected"].includes(allRequests[i].status.toLowerCase())) {
          rejected.push(allRequests[i]);
        }
      }
    } else {
      for (let i in allRequests) {

        if (
          ["waiting for vendor", "awaiting approval"].includes(
            allRequests[i].status.toLowerCase()
          ) /*&&
          allRequests[i].quotes.length &&
          ["pending", "sent"].includes(allRequests[i].quotes[0].status)*/){
          if (allRequests[i].is_urgent) allRequests[i].is_urgent = "Yes";
          else allRequests[i].is_urgent = "No";
          pending.push(allRequests[i]);
        } else if (["cancelled", "denied"].includes(allRequests[i].status?.toLowerCase())) {
          rejected.push(allRequests[i]);
        }
       
      }
    }

    setPendingRepairRequests(pending);
    setRejectedRepairRequests(rejected);
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
            activeTab={"Repair"}
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
            tabLabel={t("navigationItems.orders_repair")}
            tabIcon={faWrench}
            orderID={selectedRepair ? selectedRepair.work_order : null}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <PanelHeader icon={faWrench} text={t("repairsPanelIndex.repairs")} mobileBg={isMobile} />
          <QuickAccessTabs
            tabs={["Repair", "Maintenance", "Asset Request", "Disposal", "Transfer"]}
            activeTab={"Repair"}
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
          <CommonRepairsPanel
            category="pending"
            repairs={pendingRepairRequests}
            setAllRequests={setAllRequests}
            selectedClient={selectedClient}
            selectedRepair={selectedRepair}
            setSelectedRepair={setSelectedRepair}
            dataReady={dataReady}
            tab={activeIndex}
            isAllSelected={isAllSelected}
          />
        </TabPanel>
        <TabPanel header={t("general.rejected").toUpperCase()}>
          <CommonRepairsPanel
            category="rejected"
            repairs={rejectedRepairRequests}
            selectedRepair={selectedRepair}
            setSelectedRepair={setSelectedRepair}
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

export default RepairRequests;
