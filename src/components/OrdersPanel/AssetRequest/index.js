import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { persistSetTab } from "../../../helpers/helperFunctions";
import { persistGetTab } from "../../../helpers/helperFunctions";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendGetRequests } from "../../../helpers/HttpRequestHelper";
import * as Constants from "../../../constants";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import PanelHeader from "../../ShareComponents/helpers/PanelHeader";
import QuickAccessTabs from "../../ShareComponents/QuickAccessTabs";
import { TabView, TabPanel } from "primereact/tabview";
import CommonAssetOrdersPanel from "./CommonAssetOrdersPanel";
import GeneralRadio from "../../ShareComponents/GeneralRadio";
import CustomFilterDropdown from "../../ShareComponents/CustomFilterDropdown";
import useWindowSize from "../../ShareComponents/helpers/useWindowSize";
import Breadcrumbs from "../../ShareComponents/Breadcrumbs";
import "../../../styles/ShareComponents/Table/table.scss";
import "../../../styles/ShareComponents/TabStyles/subTab.scss";

const AssetRequestPanel = () => {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.apiCallData);
  const clients = userInfo.aux_data.client_names;
  const clientOptions = clients.map((client) => ({ name: client, code: client }));
  const [dataReady, setDataReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [allRequests, setAllRequests] = useState([]);
  const [inProgressRequests, setInProgressRequests] = useState([]);
  const [deliveredRequests, setDeliveredRequests] = useState([]);
  const [selectedAssetOrder, setSelectedAssetOrder] = useState(null);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  const { width } = useWindowSize("layout-content-inner");

  const history = useHistory();
  useEffect(() => {
    persistGetTab(setActiveIndex);
  }, []);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();

    if (!!!dataReady) {
      setSelectedAssetOrder(null);

      const callback = (result, status) => {
        if (status === "fulfilled") {
          const validStatus = [
            "approved",
            "ordered",
            "built",
            "in transit - to client",
            "delivered",
          ];
          const allRequests = result.data.filter((el) =>
            validStatus.includes(el.status?.toLowerCase())
          );

          setAllRequests(allRequests);
          setDataReady(true);
        }
      };

      const errorHandler = () => {
        setDataReady(true);
      };

      const requestURL = isAllSelected
        ? `${Constants.ENDPOINT_PREFIX}/api/v1/AssetRequest/List`
        : `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/AssetRequest/Get/${selectedClient}`;
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
    let inProgress = [];
    let delivered = [];
    const inProgressStatus = ["approved", "ordered", "built", "in transit - to client"];
    const deliveredStatus = ["delivered"];

    for (let i in allRequests) {
      if (inProgressStatus.includes(allRequests[i].status?.toLowerCase())) {
        inProgress.push(allRequests[i]);
      } else if (deliveredStatus.includes(allRequests[i].status?.toLowerCase()))
        delivered.push(allRequests[i]);
    }

    setInProgressRequests(inProgress);
    setDeliveredRequests(delivered);
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
            activeTab={"Asset Request"}
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
            tabLabel={t("assetRequest.page_title")}
            tabIcon={faHistory}
            orderID={selectedAssetOrder ? selectedAssetOrder.custom_id : null}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <PanelHeader icon={faHistory} text={t("assetRequest.page_title")} mobileBg={isMobile} />
          <QuickAccessTabs
            tabs={["Repair", "Maintenance", "Asset Request", "Disposal", "Transfer"]}
            activeTab={"Asset Request"}
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
        className="darkTable darkSubTab"
        activeIndex={activeIndex}
        onTabChange={(e) => {
          persistSetTab(e, history);
          setActiveIndex(e.index);
        }}
      >
        <TabPanel header={t("general.ongoing_order").toUpperCase()}>
          <CommonAssetOrdersPanel
            assetOrders={inProgressRequests}
            setAllRequests={setAllRequests}
            selectedClient={selectedClient}
            selectedAssetOrder={selectedAssetOrder}
            setSelectedAssetOrder={setSelectedAssetOrder}
            dataReady={dataReady}
            setDataReady={setDataReady}
            tab={activeIndex}
            isAllSelected={isAllSelected}
          />
        </TabPanel>
        <TabPanel header={t("general.completed_order").toUpperCase()}>
          <CommonAssetOrdersPanel
            assetOrders={deliveredRequests}
            selectedAssetOrder={selectedAssetOrder}
            setSelectedAssetOrder={setSelectedAssetOrder}
            dataReady={dataReady}
            setDataReady={setDataReady}
            tab={activeIndex}
            disableButtons
            isAllSelected={isAllSelected}
          />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default AssetRequestPanel;
