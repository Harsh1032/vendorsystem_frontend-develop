import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { logout } from "../../../helpers/Authorization";
import { Button } from "primereact/button";
import { faLongArrowAltLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import AppSubmenu from "./AppSubmenu";
import { AiOutlineUser } from "react-icons/ai";
import settings from "../../../images/menu/icon_sidebar_settings.png";
import logOut from "../../../images/menu/icon_sidebar_log-out.png";
import feedback from "../../../images/menu/topbar_menu_feedback.png";
import SettingsDialog from "./SettingsDialog";
import "../../../styles/Navigation/sidebar.scss";
import "../../../styles/Navigation/compactSidebar.scss";

const AppMenu = (props) => {
  const { t } = useTranslation();
  const [isMouseOverSettings, setIsMouseOverSettings] = useState(false);
  const [isSettingsPanelDisplayed, setIsSettingsPanelDisplayed] = useState(false);
  const [configPanelPosition, setConfigPanelPosition] = useState(null);

  const toggleCompactMenu = () => {
    props.setIsCompact((prevValue) => !prevValue);
  };

  let logo_img_url = process.env.PUBLIC_URL + "/assets/layout/images/logo_aukai_vendor.png";
  
  const history = useHistory();

  return (
    <div
      className={`dark-sidebar layout-sidebar ${props.isCompact && "layout-sidebar-compact"}`}
      onClick={props.onMenuClick}
    >
      <div
        className={`logo ${
          props.isCompact && props.isSlim() && !props.mobileMenuActive && "logo-hide"
        }`}
      >
        <div className="p-my-2">
          <Link to="/dashboard" className="home-btn-sidebar">
            <img id="app-logo" className="logo-image" src={logo_img_url} alt="Aukai Logo" />
          </Link>
        </div>
        <div className="logo-back-btn">
          <Button
            className="p-button-link mobile-back-btn"
            onClick={() => props.setMobileMenuActive(false)}
          >
            <FontAwesomeIcon icon={faLongArrowAltLeft} size={"4x"} color="white" />
          </Button>
        </div>
      </div>
      {props.menuMode === "slim" && !props.mobileMenuActive ? (
        <div onClick={toggleCompactMenu} className="menu-compact-toggle-container">
          <i
            className={`pi pi-angle-left menu-compact-toggle ${props.isCompact && "rotate-icon"}`}
          />
        </div>
      ) : null}
      <div className="layout-menu-container">
        <AppSubmenu
          items={props.model}
          badges={props.badges}
          menuMode={props.menuMode}
          isCompact={props.isCompact}
          parentMenuItemActive
          menuActive={props.active}
          mobileMenuActive={props.mobileMenuActive}
          root
          onMenuitemClick={props.onMenuitemClick}
          onRootMenuitemClick={props.onRootMenuitemClick}
        />

        <div className="sidebar-bottom-btn-group p-pt-3">
          <div className="settings-btn">
            <div
              className={isMouseOverSettings ? "config-button-hovered" : "config-button"}
              onClick={(e) => {
                setIsSettingsPanelDisplayed(true);
                setConfigPanelPosition(e.target.offsetLeft);
              }}
              onMouseEnter={() => {
                setIsMouseOverSettings(true);
              }}
              onMouseLeave={() => {
                setIsMouseOverSettings(false);
              }}
            >
              <img src={settings} alt="settings" />
            </div>
            <span className={isMouseOverSettings ? "config-txt-hovered" : "config-txt"}>
              {t("settings.settings")}
            </span>
          </div>
        </div>

        <div className="sidebar-bottom-nav">
          <div className="sidebar-bottom-nav-group">
            <button
              onClick={(e) => {
                props.setMobileMenuActive(false);
                history.push("/feedback");
              }}
            >
              <img src={feedback} alt="feedback" />
              <span>{t("navigationItems.feedback")}</span>
            </button>
          </div>
          <div className="sidebar-bottom-nav-group">
            <button
              className="sidebar-profile-btn"
              onClick={() => {
                props.setMobileMenuActive(false);
                history.push("/account-options");
              }}
            >
              <AiOutlineUser />
              <span>Profile</span>
            </button>
          </div>
          <div className="sidebar-bottom-nav-group">
            <button
              onClick={(e) => {
                props.setMobileMenuActive(false);
                setIsSettingsPanelDisplayed(true);
                setConfigPanelPosition(e.target.offsetLeft);
              }}
            >
              <img src={settings} alt="settings" />
              <span>{t("settings.settings")}</span>
            </button>
          </div>
          <div className="sidebar-bottom-nav-group">
            <button
              onClick={() => {
                logout();
                window.location = "/";
              }}
            >
              <img src={logOut} alt="" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {isSettingsPanelDisplayed && (
        <SettingsDialog
          setIsSettingsPanelDisplayed={setIsSettingsPanelDisplayed}
          configPanelPosition={configPanelPosition}
        />
      )}
    </div>
  );
};

export default AppMenu;
