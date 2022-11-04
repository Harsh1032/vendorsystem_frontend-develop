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
import GeneralRadio from "../../ShareComponents/GeneralRadio";
import CustomFilterDropdown from "../../ShareComponents/CustomFilterDropdown";
import useWindowSize from "../../ShareComponents/helpers/useWindowSize";
import Breadcrumbs from "../../ShareComponents/Breadcrumbs";
import "../../../styles/ShareComponents/Table/table.scss";
import "../../../styles/ShareComponents/TabStyles/subTab.scss";

const RepairPanel = () => {
  const { userInfo } = useSelector((state) => state.apiCallData);
  const clients = userInfo.aux_data.client_names;
  const clientOptions = clients.map((client) => ({ name: client, code: client }));
  const [dataReady, setDataReady] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [repairRequests, setRepairRequests] = useState([]);
  const [completeRepairRequests, setCompleteRepairRequests] = useState([]);
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
      const callback = (result, status) => {
        if (status === "fulfilled") {
          const validStatus = [
            "approved",
            "in transit - to vendor",
            "in transit - to client",
            "at vendor",
            "complete",
            "delivered",
          ];
          const data = result.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));

          setAllRequests(data);
          setDataReady(true);
        }
      };

      const errorHandler = () => {
        setDataReady(true);
      };
      const requestURL = isAllSelected
        ? `${Constants.ENDPOINT_PREFIX}/api/v1/Repair/List`
        : `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Repair/Get/${selectedClient}`;

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
    return () => {
      //Doing clean up work, cancel the asynchronous api call
      cancelTokenSource.cancel("cancel the asynchronous api call from custom hook");
    };
  }, [dataReady, isAllSelected, selectedClient]);

  useEffect(() => {
    const inProgressRepairs = [];
    const completedRepairs = [];

    for (let i in allRequests) {
      if (
        [
          "approved",
          "in transit - to vendor",
          "in transit - to client",
          "at vendor",
          "complete",
        ].includes(allRequests[i].status?.toLowerCase())
      ) {
        if (allRequests[i].is_urgent) allRequests[i].is_urgent = "Yes";
        else allRequests[i].is_urgent = "No";
        inProgressRepairs.push(allRequests[i]);
      } else completedRepairs.push(allRequests[i]);
    }

    setRepairRequests(inProgressRepairs);
    setCompleteRepairRequests(completedRepairs);
  }, [allRequests]);

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
              "/orders",
              "/orders/maintenance",
              "/orders/asset-request",
              "/orders/disposal",
              "/orders/transfer",
            ]}
            scrollable={width < 420}
          />
          <Breadcrumbs
            module={t("navigationItems.orders")}
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
              "/orders",
              "/orders/maintenance",
              "/orders/asset-request",
              "/orders/disposal",
              "/orders/transfer",
            ]}
            scrollable={width < 786}
          />
        </React.Fragment>
      )}
      <div className="p-field mt-4 mb-4">
        <GeneralRadio
          labelStyle={{ display: "none" }}
          customBtnStyle={{ color: "white", fontWeight: 600 }}
          labels={["", t("general.show_all_orders"), t("general.show_orders_by_client")]}
          value={isAllSelected}
          name="isAllSelected"
          onChange={setIsAllSelected}
          onCallBack={requestsOnChange}
        />
      </div>
      {!isAllSelected && (
        <CustomFilterDropdown
          className={`p-mt-3 ${isMobile ? "w-100" : "w-25"}`}
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
        <TabPanel header={t("general.ongoing_order").toUpperCase()}>
          <CommonRepairsPanel
            category="inProgress"
            repairs={repairRequests}
            selectedRepair={selectedRepair}
            setSelectedRepair={setSelectedRepair}
            setAllRequests={setAllRequests}
            selectedClient={selectedClient}
            dataReady={dataReady}
            tab={activeIndex}
            isAllSelected={isAllSelected}
          />
        </TabPanel>
        <TabPanel header={t("general.completed_order").toUpperCase()}>
          <CommonRepairsPanel
            category="completed"
            repairs={completeRepairRequests}
            selectedRepair={selectedRepair}
            setSelectedRepair={setSelectedRepair}
            setAllRequests={setAllRequests}
            dataReady={dataReady}
            tab={activeIndex}
            disableButtons
            isAllSelected={isAllSelected}
          />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default RepairPanel;
