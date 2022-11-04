import React, { useEffect, useState } from "react";
import axios from "axios";
//REMOVE THIS FAKE AXIOS IF BE IS READY
import FakeAxios from "./FakeAxios";

import { getAuthHeader } from "../../../helpers/Authorization";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import * as Constants from "../../../constants";
import useWindowSize from "../../ShareComponents/helpers/useWindowSize";
import { faListUl } from "@fortawesome/free-solid-svg-icons";
import QuickAccessTabs from "../../ShareComponents/QuickAccessTabs";
import PanelHeader from "../../ShareComponents/helpers/PanelHeader";
import { TabView, TabPanel } from "primereact/tabview";
import { persistGetTab, persistSetTab } from "../../../helpers/helperFunctions";
import GeneralRadio from "../../ShareComponents/GeneralRadio";
import CustomFilterDropdown from "../../ShareComponents/CustomFilterDropdown";
import CommonTransfersPanel from "./CommonTransfersPanel";
import Breadcrumbs from "../../ShareComponents/Breadcrumbs";
import "../../../styles/ShareComponents/Table/table.scss";
import "../../../styles/ShareComponents/TabStyles/subTab.scss";

//REMOVE THIS FAKE AXIOS IF BE IS READY
const fakeAxios = new FakeAxios(true);

const TransferPanel = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { userInfo } = useSelector((state) => state.apiCallData);
  const clients = userInfo.aux_data.client_names;
  const clientOptions = clients.map((client) => ({ name: client, code: client }));
  const [dataReady, setDataReady] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [transferRequests, setTransferRequests] = useState([]);
  const [completeTransferRequests, setCompleteTransferRequests] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  const { width } = useWindowSize("layout-content-inner");

  useEffect(() => {
    persistGetTab(setActiveIndex);
  }, []);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (!!!dataReady) {
      const callback = (result, status) => {
        if (status === "fulfilled") {
          //MIGHT NEED TO CHANGE THE VALID STATUSES DEPENDING ON BACKEND SETTING
          const validStatus = ["approved", "awaiting transfer", "in transit", "delivered"];
          const data = result.data.filter((el) => validStatus.includes(el.status?.toLowerCase()));

          setAllRequests(data);
          setDataReady(true);
        }
      };

      const errorHandler = (err) => {
        setDataReady(true);
        console.log(err);
      };

      //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
      //BELOW IS MOCKING API REQUEST AND RESPONSE
      //TODO CHANGE THIS ONCE BACKEND IS READY TO USE
      const requestURL = isAllSelected
        ? `${Constants.ENDPOINT_PREFIX}/api/v1/Transfer/List`
        : `${Constants.ENDPOINT_PREFIX}/api-client/v1/Client/Transfer/Get/${selectedClient}`;

      fakeAxios
        // eslint-disable-next-line no-undef
        .get(requestURL, _, {
          ...getAuthHeader(),
          cancelToken: cancelTokenSource.token,
        })
        .then((res) => callback(res, res.status))
        .catch((err) => errorHandler(err));

      //ABOVE IS MOCKING API REQUEST AND RESPONSE
      //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      // sendGetRequests(
      //   [requestURL],
      //   {
      //     ...getAuthHeader(),
      //     cancelToken: cancelTokenSource.token,
      //   },
      //   [callback],
      //   errorHandler
      // );
    }
    return () => {
      //Doing clean up work, cancel the asynchronous api call
      cancelTokenSource.cancel("cancel the asynchronous api call from custom hook");
    };
  }, [dataReady, isAllSelected, selectedClient]);

  useEffect(() => {
    const inProgressTransfers = [];
    const completeTransfers = [];

    for (let i in allRequests) {
      //MIGHT NEED TO CHANGE THE VALID STATUSES DEPENDING ON BACKEND SETTING
      if (
        ["approved", "awaiting transfer", "in transit"].includes(
          allRequests[i].status?.toLowerCase()
        )
      ) {
        inProgressTransfers.push(allRequests[i]);
      } else completeTransfers.push(allRequests[i]);
    }

    setTransferRequests(inProgressTransfers);
    setCompleteTransferRequests(completeTransfers);
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
            activeTab={"Transfer"}
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
            tabLabel={t("navigationItems.orders_transfer")}
            tabIcon={faListUl}
            orderID={selectedTransfer ? selectedTransfer.client_request_work_order : null}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <PanelHeader
            icon={faListUl}
            text={t("assetTransferPanel.page_title")}
            mobileBg={isMobile}
          />
          <QuickAccessTabs
            tabs={["Repair", "Maintenance", "Asset Request", "Disposal", "Transfer"]}
            activeTab={"Transfer"}
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
          <CommonTransfersPanel
            category="inProgress"
            transfers={transferRequests}
            selectedTransfer={selectedTransfer}
            setSelectedTransfer={setSelectedTransfer}
            setAllRequests={setAllRequests}
            selectedClient={selectedClient}
            dataReady={dataReady}
            tab={activeIndex}
            isAllSelected={isAllSelected}
          />
        </TabPanel>
        <TabPanel header={t("general.completed_order").toUpperCase()}>
          <CommonTransfersPanel
            category="completed"
            transfers={completeTransferRequests}
            selectedTransfer={selectedTransfer}
            setSelectedTransfer={setSelectedTransfer}
            setAllRequests={setAllRequests}
            selectedClient={selectedClient}
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

export default TransferPanel;
