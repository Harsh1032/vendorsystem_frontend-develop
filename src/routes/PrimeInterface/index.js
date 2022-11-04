import React, { useState, useEffect, lazy, Suspense } from "react";
import { useHistory, Redirect, BrowserRouter as Router, Switch, Route } from "react-router-dom";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import * as Constants from "../../constants";
import NavigationItems from "../../routes/NavigationItems";
import VINSearch from "../../components/ShareComponents/helpers/VINSearch";
import PrivateRoute from "../PrivateRoute";
import AppTopbar from "../../components/ShareComponents/Navigation/AppTopbar";
import AppMenu from "../../components/ShareComponents/Navigation/AppMenu";
import AppRightMenu from "../../components/ShareComponents/Navigation/AppRightMenu";
import AppSearch from "../../components/ShareComponents/AppSearch";
import bgVid from "../../images/background/Dark_bg.mp4";

// For gear icon
// import AppConfig from "../../AppConfig";
// import PrimeReact from "primereact/api";
import classNames from "classnames";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./PrimeInterface.scss";
import {
  getAuthHeader,
  hasModulePermission,
  tokenRefresh,
  setAgreementHeader,
  getAgreementStatus,
  logout,
} from "../../helpers/Authorization";
import { sendPostRequest } from "../../helpers/HttpRequestHelper";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useIdleTimer } from "react-idle-timer";
import { timeoutAlert } from "../../components/ShareComponents/CommonAlert";
import { FRONTEND_TIMEOUT } from "../../constants";
import FirstTimePwd from "../../components/ShareComponents/FirstTimePwd";
import SystemAssistant from "../../components/ShareComponents/SystemAssistant";
import PageSkeleton from "../../components/ShareComponents/CustomSkeleton/PageSkeleton";
import ErrorBoundary from "../../components/ShareComponents/ErrorBoundary";
import { isMobileDevice } from "../../helpers/helperFunctions";

const Profile = lazy(() => import("../../components/AccountOptions/Profile"));
const FeedbackPanel = lazy(() => import("../../components/FeedbackPanel"));

const VINSearchWrapper = () => {
  let history = useHistory();

  return (
    <VINSearch
      onVehicleSelected={(vehicle) => {
        if (vehicle) history.push("/asset-details/" + vehicle.VIN);
      }}
    />
  );
};

const PrimeInterface = () => {
  const { t } = useTranslation();
  const { initDataLoaded, userInfo } = useSelector((state) => state.apiCallData);
  // Check init data setup
  if (!initDataLoaded) {
    logout();
  }

  const [inputStyle, setInputStyle] = useState("outlined"); // eslint-disable-line no-unused-vars
  const [ripple, setRipple] = useState(false); // eslint-disable-line no-unused-vars
  const [colorScheme, setColorScheme] = useState("light"); // eslint-disable-line no-unused-vars
  const [menuTheme, setMenuTheme] = useState("layout-sidebar-blue"); // eslint-disable-line no-unused-vars

  const [menuActive, setMenuActive] = useState(false);
  const [menuMode, setMenuMode] = useState("slim");
  const [isCompact, setIsCompact] = useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [staticMenuDesktopInactive, setStaticMenuDesktopInactive] = useState(false);
  const [staticMenuMobileActive, setStaticMenuMobileActive] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [topbarUserMenuActive, setTopbarUserMenuActive] = useState(false);
  const [topbarNotificationMenuActive, setTopbarNotificationMenuActive] = useState(false);
  const [rightMenuActive, setRightMenuActive] = useState(false);
  const [configActive, setConfigActive] = useState(false);
  const [warningMsg, setWarningMsg] = useState(false);
  const [agreementDialog, setAgreementDialog] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [assitantStatus, setAssistantStatus] = useState(false);
  const dispatch = useDispatch();
  const [badges, setBadges] = useState({
    issues: 0,
    repairs: 0,
    maintenances: 0,
    incidents: 0,
    opChecks: 0,
  });
  const [notificationInfo, setNotificationInfo] = useState({ total: 0, approval: 0 });
  const userInformation = {
    name: userInfo?.user.first_name + " " + userInfo?.user.last_name,
    picUrl: userInfo?.detailed_user.image_url
      ? userInfo?.detailed_user.image_url
      : process.env.PUBLIC_URL + "/user_img_placeholder.jpg",
  };

  //Front-end Timeout
  const timeout = FRONTEND_TIMEOUT;
  const handleOnIdle = () => {
    pause();
    timeoutAlert(timeout, () => reset());
  };
  const { reset, pause } = useIdleTimer({
    timeout: timeout,
    onIdle: handleOnIdle,
    debounce: 500,
  });

  //Token refresh
  useEffect(() => {
    tokenRefresh();
  }, []);

  useEffect(() => {
    const agreementStatus = getAgreementStatus();
    if (!agreementStatus) {
      setAgreementDialog(true);
      setAssistantStatus(true);
    }
  }, []);

  let menuClick = false;
  let searchClick = false;
  let userMenuClick = false;
  let notificationMenuClick = false;
  let rightMenuClick = false;
  let configClick = false;

  // based on role permisison to filter all the navigation items that user have permission to access
  let userNavItems = [];
  NavigationItems.forEach((item) => {
    let navItem = { ...item };

    if (!!item.items) {
      let navSubMenu = [];
      item.items.forEach((subItem) => {
        navSubMenu.push({ ...subItem });
      });
      if (navSubMenu.length > 0) {
        navItem.items = navSubMenu;
        navItem.to = navSubMenu[0].to; // the parent nav item path will be first submenu path
      } else {
        navItem.items = [];
        navItem.to = "/assets";
      }
    }
    userNavItems.push(navItem);
  });

  useEffect(() => {
    if (staticMenuMobileActive) {
      blockBodyScroll();
    } else {
      unblockBodyScroll();
    }
  }, [staticMenuMobileActive]);

  useEffect(() => {
    function handleResize() {
      // Set corresponding menu mode
      if (window.innerHeight < 875) {
        setMenuMode("static");
      } else {
        setMenuMode("slim");
      }
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // For gear icon
  // const onInputStyleChange = (inputStyle) => {
  //   setInputStyle(inputStyle);
  // };

  // const onRippleChange = (e) => {
  //   PrimeReact.ripple = e.value;
  //   setRipple(e.value);
  // };

  const onDocumentClick = () => {
    if (!searchClick && searchActive) {
      onSearchHide();
    }

    if (!userMenuClick) {
      setTopbarUserMenuActive(false);
    }

    if (!notificationMenuClick) {
      setTopbarNotificationMenuActive(false);
    }

    if (!rightMenuClick) {
      setRightMenuActive(false);
    }

    if (!menuClick) {
      if (isSlim()) {
        setMenuActive(false);
      }

      if (overlayMenuActive || staticMenuMobileActive) {
        hideOverlayMenu();
      }

      unblockBodyScroll();
    }

    if (configActive && !configClick) {
      setConfigActive(false);
    }

    searchClick = false;
    configClick = false;
    userMenuClick = false;
    rightMenuClick = false;
    notificationMenuClick = false;
    menuClick = false;
  };

  const onMenuClick = () => {
    menuClick = true;
  };

  const onMenuButtonClick = (event) => {
    menuClick = true;
    setTopbarUserMenuActive(false);
    setTopbarNotificationMenuActive(false);
    setRightMenuActive(false);

    if (isOverlay()) {
      setOverlayMenuActive((prevOverlayMenuActive) => !prevOverlayMenuActive);
    }

    if (isDesktop()) {
      setStaticMenuDesktopInactive(
        (prevStaticMenuDesktopInactive) => !prevStaticMenuDesktopInactive
      );
    } else {
      setStaticMenuMobileActive((prevStaticMenuMobileActive) => !prevStaticMenuMobileActive);
    }

    event.preventDefault();
  };

  const onMenuitemClick = (event) => {
    if (!event.item.items) {
      hideOverlayMenu();

      if (isSlim()) {
        setMenuActive(false);
      }
    }
  };

  const onRootMenuitemClick = () => {
    setMenuActive((prevMenuActive) => !prevMenuActive);
  };

  // For gear icon
  // const onMenuThemeChange = (name) => {
  //   setMenuTheme("layout-sidebar-" + name);
  // };

  // const onMenuModeChange = (e) => {
  //   setMenuMode(e.value);
  // };

  // const onColorSchemeChange = (e) => {
  //   setColorScheme(e.value);
  // };

  const onTopbarUserMenuButtonClick = (event) => {
    userMenuClick = true;
    setTopbarUserMenuActive((prevTopbarUserMenuActive) => !prevTopbarUserMenuActive);

    hideOverlayMenu();

    event.preventDefault();
  };

  const onTopbarNotificationMenuButtonClick = (event) => {
    notificationMenuClick = true;
    setTopbarNotificationMenuActive(
      (prevTopbarNotificationMenuActive) => !prevTopbarNotificationMenuActive
    );

    hideOverlayMenu();

    event.preventDefault();
  };

  const toggleSearch = () => {
    setSearchActive((prevSearchActive) => !prevSearchActive);
    searchClick = true;
  };

  const onSearchClick = () => {
    searchClick = true;
  };

  const onSearchHide = () => {
    setSearchActive(false);
    searchClick = false;
  };

  const onRightMenuClick = () => {
    rightMenuClick = true;
  };

  const onRightMenuButtonClick = (event) => {
    rightMenuClick = true;
    setRightMenuActive((prevRightMenuActive) => !prevRightMenuActive);
    hideOverlayMenu();
    event.preventDefault();
  };

  // For gear icon
  // const onConfigClick = () => {
  //   configClick = true;
  // };

  // const onConfigButtonClick = () => {
  //   setConfigActive((prevConfigActive) => !prevConfigActive);
  //   configClick = true;
  // };

  const hideOverlayMenu = () => {
    setOverlayMenuActive(false);
    setStaticMenuMobileActive(false);
    unblockBodyScroll();
  };

  const blockBodyScroll = () => {
    if (document.body.classList) {
      document.body.classList.add("blocked-scroll");
    } else {
      document.body.className += " blocked-scroll";
    }
  };

  const unblockBodyScroll = () => {
    if (document.body.classList) {
      document.body.classList.remove("blocked-scroll");
    } else {
      document.body.className = document.body.className.replace(
        new RegExp("(^|\\b)" + "blocked-scroll".split(" ").join("|") + "(\\b|$)", "gi"),
        " "
      );
    }
  };

  const isSlim = () => {
    return menuMode === "slim";
  };

  const isOverlay = () => {
    return menuMode === "overlay";
  };

  const isDesktop = () => {
    return window.innerWidth > 991;
  };

  const containerClassName = classNames(
    "layout-wrapper",
    `${isMobileDevice() ? "p-pt-4" : ""}`,
    {
      "layout-overlay": menuMode === "overlay",
      "layout-static": menuMode === "static",
      "layout-slim": menuMode === "slim",
      "layout-sidebar-dim": colorScheme === "dim",
      "layout-sidebar-dark": colorScheme === "dark",
      "layout-overlay-active": overlayMenuActive,
      "layout-mobile-active": staticMenuMobileActive,
      "layout-static-inactive": staticMenuDesktopInactive && menuMode === "static",
      "p-input-filled": inputStyle === "filled",
      "p-ripple-disabled": !ripple,
    },
    colorScheme === "light" ? menuTheme : ""
  );

  const handleAgreementChecked = () => {
    setAgreementHeader(true);
    setAgreementDialog(false);

    const callback = (r) => {
      setAgreementHeader(true);
    };

    const errorHandler = (err) => {};

    sendPostRequest(
      `${Constants.ENDPOINT_PREFIX}/api-auth/v1/User/Update/Agreement`,
      {
        agreement_accepted: true,
      },
      getAuthHeader(),
      callback,
      errorHandler
    );
  };

  const renderAgreementFooter = () => {
    return (
      <div className={`p-mt-4 p-d-flex p-jc-between ${!isDesktop() && "flex-wrap"}`}>
        <div className="p-d-flex p-flex-column">
          <div className="p-d-flex p-jc-start">
            <Checkbox
              inputId="agreement"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.checked)}
            />
            <label htmlFor="agreement" className="p-checkbox-label p-mb-0 p-ml-2 font-weight-bold">
              {t("firstTimeAgreement.agreement_checkbox")}
            </label>
          </div>
          {warningMsg && (
            <div className="text-left">
              <i className="pi pi-exclamation-circle text-danger" style={{ fontSize: "12px" }} />
              <span className="p-ml-2 text-danger">
                {t("firstTimeAgreement.agreement_warning_msg")}
              </span>
            </div>
          )}
        </div>
        <Button
          label={t("general.confirm")}
          icon="pi pi-check"
          onClick={handleAgreementChecked}
          disabled={!agreementChecked}
          className={!isDesktop() && "w-100 mt-2"}
        />
      </div>
    );
  };

  return (
    <Router>
      <div className={containerClassName} data-theme={colorScheme} onClick={onDocumentClick}>
        <div
          className={`layout-content-wrapper ${
            isSlim() && isCompact && isDesktop() && "layout-content-wrapper-compact"
          }`}
        >
          <video playsInline autoPlay muted loop className="bg-vid">
            <source src={bgVid} type="video/mp4" />
          </video>
          <AppTopbar
            notificationInfo={notificationInfo}
            userInfo={userInformation}
            routers={userNavItems}
            topbarNotificationMenuActive={topbarNotificationMenuActive}
            topbarUserMenuActive={topbarUserMenuActive}
            onMenuButtonClick={onMenuButtonClick}
            onSearchClick={toggleSearch}
            onTopbarNotification={onTopbarNotificationMenuButtonClick}
            onTopbarUserMenu={onTopbarUserMenuButtonClick}
            onRightMenuClick={onRightMenuButtonClick}
            onRightMenuButtonClick={onRightMenuButtonClick}
            assitantStatus={assitantStatus}
            setAssistantStatus={setAssistantStatus}
          />
          <div className="layout-content">
            <div className="layout-content-inner">
              {/* First time login changepwd
                {userInfo.detailed_user.first_time_login && <FirstTimePwd />}
              */}

              {/* First time login agreement
              {!userInfo.detailed_user.first_time_login && (
                <Dialog
                  header={t("firstTimeAgreement.agreement_title")}
                  visible={agreementDialog}
                  style={{ width: "50vw" }}
                  breakpoints={{ "1440px": "75vw", "980px": "85vw", "600px": "90vw" }}
                  footer={renderAgreementFooter()}
                  onHide={() => setWarningMsg(true)}
                  maximizable
                >
                  <p className="p-mx-3">{t("firstTimeAgreement.agreement_content")}</p>
                </Dialog>
              )}
              */}

              {/* First time login Assistant
              {isDesktop() &&
                assitantStatus &&
                !agreementDialog &&
                !userInfo.detailed_user.first_time_login && (
                  <SystemAssistant setAssistantStatus={setAssistantStatus} />
                )}
              */}

              <Switch>
                <ErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <Route exact path="/">
                      {!!getAuthHeader() && <Redirect to="/dashboard" />}
                    </Route>
                    <Route path="/account-options" exact>
                      <Profile />
                    </Route>
                    <Route path="/asset-details" exact>
                      <VINSearchWrapper />
                    </Route>
                    <Route path="/feedback">
                      <FeedbackPanel />
                    </Route>
                    {NavigationItems.map((item) => {
                      if (!!item.separator) return null;
                      if (item.items === undefined) {
                        return (
                          <PrivateRoute
                            key={item.label}
                            path={item.to}
                            module={item.module}
                            exact={item.exact}
                            component={item.content}
                          />
                        );
                      } else {
                        return item.items.map((subitem) => {
                          return (
                            <PrivateRoute
                              key={subitem.label}
                              path={subitem.to}
                              module={subitem.module}
                              exact={subitem.exact}
                              component={subitem.content}
                            />
                          );
                        });
                      }
                    })}
                  </Suspense>
                </ErrorBoundary>
              </Switch>
            </div>
          </div>
        </div>
        <AppMenu
          model={userNavItems}
          badges={badges}
          menuMode={menuMode}
          isCompact={isCompact}
          setIsCompact={setIsCompact}
          isSlim={isSlim}
          active={menuActive}
          setMobileMenuActive={setStaticMenuMobileActive}
          mobileMenuActive={staticMenuMobileActive}
          onMenuClick={onMenuClick}
          onMenuitemClick={onMenuitemClick}
          onRootMenuitemClick={onRootMenuitemClick}
          notificationInfo={notificationInfo}
        />

        <AppRightMenu rightMenuActive={rightMenuActive} onRightMenuClick={onRightMenuClick} />

        {/*Gear Icon from primeReact, might need it in the future */}
        {/*
        <AppConfig
          configActive={configActive}
          menuMode={menuMode}
          onMenuModeChange={onMenuModeChange}
          menuTheme={menuTheme}
          onMenuThemeChange={onMenuThemeChange}
          colorScheme={colorScheme}
          onColorSchemeChange={onColorSchemeChange}
          onConfigClick={onConfigClick}
          onConfigButtonClick={onConfigButtonClick}
          rippleActive={ripple}
          onRippleChange={onRippleChange}
          inputStyle={inputStyle}
          onInputStyleChange={onInputStyleChange}
        />
        */}

        <AppSearch
          searchActive={searchActive}
          onSearchClick={onSearchClick}
          onSearchHide={onSearchHide}
        />
      </div>
    </Router>
  );
};

export default PrimeInterface;
