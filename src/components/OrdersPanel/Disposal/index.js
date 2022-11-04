import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { TabView, TabPanel } from "primereact/tabview";
import { faRecycle } from "@fortawesome/free-solid-svg-icons";
import { sendGetRequests } from "../../../helpers/HttpRequestHelper";
import { getAuthHeader } from "../../../helpers/Authorization";
import * as Constants from "../../../constants";
import CommonRemovalPanel from "./CommonRemovalPanel";
import { capitalize } from "../../../helpers/helperFunctions";
import PanelHeader from "../../ShareComponents/helpers/PanelHeader";
import QuickAccessTabs from "../../ShareComponents/QuickAccessTabs";
import { useHistory } from "react-router-dom";
import { persistSetTab } from "../../../helpers/helperFunctions";
import { persistGetTab } from "../../../helpers/helperFunctions";
import GeneralRadio from "../../ShareComponents/GeneralRadio";
import CustomFilterDropdown from "../../ShareComponents/CustomFilterDropdown";
import useWindowSize from "../../ShareComponents/helpers/useWindowSize";
import Breadcrumbs from "../../ShareComponents/Breadcrumbs";
import "../../../styles/ShareComponents/Table/table.scss";
import "../../../styles/ShareComponents/TabStyles/subTab.scss";

const DisposalPanel = () => {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.apiCallData);
  const clients = userInfo.aux_data.client_names;
  const clientOptions = clients.map((client) => ({ name: client, code: client }));
  const [dataReady, setDataReady] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [completeDisposals, setCompleteDisposals] = useState([]);
  const [incompleteDisposals, setIncompleteDisposals] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [selectedDisposal, setSelectedDisposal] = useState(null);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  const { width } = useWindowSize("layout-content-inner");

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
            "at vendor",
            "in progress",
            "complete",
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
        ? `${Constants.ENDPOINT_PREFIX}/api/v1/AssetDisposal/List`
        : `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetDisposal/Get/${selectedClient}`;
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
    let complete = [];
    let incomplete = [];
    const completeStatus = ["complete"];
    const incompleteStatus = ["approved", "in transit - to vendor", "at vendor", "in progress"];

    allRequests.forEach((disposal, index) => {
      allRequests[index].disposal_type = capitalize(disposal.disposal_type);
      if (completeStatus.includes(disposal.status?.toLowerCase())) {
        complete.push(disposal);
      } else if (incompleteStatus.includes(disposal.status?.toLowerCase())) {
        incomplete.push(disposal);
      }
    });

    setCompleteDisposals(complete);
    setIncompleteDisposals(incomplete);
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
            activeTab={"Disposal"}
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
            tabLabel={t("navigationItems.orders_disposal")}
            tabIcon={faRecycle}
            orderID={selectedDisposal ? selectedDisposal.custom_id : null}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <PanelHeader
            icon={faRecycle}
            text={t("removalHistory.panel_title")}
            mobileBg={isMobile}
          />
          <QuickAccessTabs
            tabs={["Repair", "Maintenance", "Asset Request", "Disposal", "Transfer"]}
            activeTab={"Disposal"}
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
        <TabPanel header={t("general.ongoing_order").toUpperCase()}>
          <CommonRemovalPanel
            className="p-mt-2"
            removalsData={incompleteDisposals}
            setAllRequests={setAllRequests}
            selectedClient={selectedClient}
            selectedAsset={selectedDisposal}
            setSelectedAsset={setSelectedDisposal}
            dataReady={dataReady}
            tab={activeIndex}
            isAllSelected={isAllSelected}
          />
        </TabPanel>
        <TabPanel header={t("general.completed_order").toUpperCase()}>
          <CommonRemovalPanel
            className="p-mt-2"
            removalsData={completeDisposals}
            setAllRequests={setAllRequests}
            selectedAsset={selectedDisposal}
            setSelectedAsset={setSelectedDisposal}
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

export default DisposalPanel;
