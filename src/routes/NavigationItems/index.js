import { lazy } from "react";
import dashboard from "../../images/menu/icon_menu_dashboard.png";
import orders from "../../images/menu/icon_menu_orders.png";
import requests from "../../images/menu/icon_menu_requests.png";
import pricing from "../../images/menu/icon_menu_price.png";
import repairs from "../../images/menu/icon_menu_repairs.png";
import maintenance from "../../images/menu/icon_menu_maintenance.png";
import disposal from "../../images/menu/icon_menu_disposal.png";
import assets from "../../images/menu/icon_menu_assets.png";
import transfers from "../../images/menu/icon_menu_transfers.png";
import "../../styles/navigationSidebar.scss";

const DashboardPanel = lazy(() => import("../../components/Dashboard"));

// Orders
const RepairPanel = lazy(() => import("../../components/OrdersPanel/Repair"));
const MaintenancePanel = lazy(() => import("../../components/OrdersPanel/Maintenance"));
const AssetRequestPanel = lazy(() => import("../../components/OrdersPanel/AssetRequest"));
const DisposalPanel = lazy(() => import("../../components/OrdersPanel/Disposal"));
const TransferPanel = lazy(() => import("../../components/OrdersPanel/Transfer"));
// Requests
const RepairRequestsPanel = lazy(() => import("../../components/RequestsPanel/RepairRequests"));
const MaintenanceRequestsPanel = lazy(() =>
  import("../../components/RequestsPanel/MaintenanceRequests")
);
const AssetRequestsPanel = lazy(() => import("../../components/RequestsPanel/AssetRequests"));
const DisposalRequestsPanel = lazy(() => import("../../components/RequestsPanel/DisposalRequests"));
const TransferRequestsPanel = lazy(() => import("../../components/RequestsPanel/TransferRequests"));
// Pricing
const PricingPanel = lazy(() => import("../../components/PricingPanel/ManagePricing"));
const DiscountsPanel = lazy(() => import("../../components/PricingPanel/Discounts"));
const NegotiatedPricingPanel = lazy(() =>
  import("../../components/PricingPanel/NegotiatedPricing")
);

/* Navigation items in JSON format */
const NavigationItems = [
  {
    label: "navigationItems.dashboard",
    image: dashboard,
    to: "/dashboard",
    exact: true,
    module: true,
    items: [
      {
        label: "navigationItems.homepage",
        image: dashboard,
        to: "/dashboard",
        exact: true,
        module: true,
        content: DashboardPanel,
      },
    ],
  },
  { separator: true },
  {
    label: "navigationItems.orders",
    image: orders,
    to: "/orders",
    exact: true,
    module: true,
    items: [
      {
        label: "navigationItems.orders_repair",
        image: repairs,
        to: "/orders",
        exact: true,
        module: true,
        content: RepairPanel,
      },
      {
        label: "navigationItems.orders_maintenance",
        image: maintenance,
        to: "/orders/maintenance",
        exact: true,
        module: true,
        content: MaintenancePanel,
      },
      {
        label: "navigationItems.orders_asset_request",
        image: assets,
        to: "/orders/asset-request",
        exact: true,
        module: true,
        content: AssetRequestPanel,
      },
      {
        label: "navigationItems.orders_disposal",
        image: disposal,
        to: "/orders/disposal",
        exact: true,
        module: true,
        content: DisposalPanel,
      },
      {
        label: "navigationItems.orders_transfer",
        image: transfers,
        to: "/orders/transfer",
        exact: true,
        module: true,
        content: TransferPanel,
      },
    ],
  },
  { separator: true },
  {
    label: "navigationItems.requests",
    image: requests,
    to: "/requests",
    exact: true,
    module: true,
    items: [
      {
        label: "navigationItems.request_repair",
        image: repairs,
        to: "/requests",
        exact: true,
        module: true,
        content: RepairRequestsPanel,
      },
      {
        label: "navigationItems.request_maintenance",
        image: maintenance,
        to: "/requests/maintenance",
        exact: true,
        module: true,
        content: MaintenanceRequestsPanel,
      },
      {
        label: "navigationItems.request_asset_request",
        image: assets,
        to: "/requests/asset-request",
        exact: true,
        module: true,
        content: AssetRequestsPanel,
      },
      {
        label: "navigationItems.request_disposal",
        image: disposal,
        to: "/requests/disposal",
        exact: true,
        module: true,
        content: DisposalRequestsPanel,
      },
      {
        label: "navigationItems.request_transfer",
        image: transfers,
        to: "/requests/transfer",
        exact: true,
        module: true,
        content: TransferRequestsPanel,
      },
    ],
  },
  { separator: true },
  {
    label: "navigationItems.pricing",
    image: pricing,
    to: "/pricing",
    exact: true,
    module: true,
    items: [
      {
        label: "navigationItems.pricing_manage",
        to: "/pricing",
        image: pricing,
        exact: true,
        module: true,
        content: PricingPanel,
      },
      {
        label: "navigationItems.pricing_discounts",
        to: "/pricing/discounts",
        image: pricing,
        exact: true,
        module: true,
        content: DiscountsPanel,
      },
      {
        label: "navigationItems.pricing_negotiated_pricing",
        to: "/pricing/negotiated",
        image: pricing,
        exact: true,
        module: true,
        content: NegotiatedPricingPanel,
      },
    ],
  },
];

export default NavigationItems;
