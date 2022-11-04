import React, { useRef, useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import classNames from "classnames";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { logout, getUserInfo } from "../../../helpers/Authorization";
import { OverlayPanel } from "primereact/overlaypanel";
import { isMobileDevice } from "../../../helpers/helperFunctions";
import FleetGuru from "./FleetGuru";
import feedback from "../../../images/menu/topbar_menu_feedback.png";
import robotOff from "../../../images/menu/topbar_menu_robot_default.png";
import robotOn from "../../../images/menu/topbar_menu_robot_on.png";
import "../../../styles/ShareComponents/Navigation/topbar.scss";
import "../../../styles/ShareComponents/Navigation/FleetGuru.scss";

const AppTopbar = (props) => {
  const [userInfo, setUserInfo] = useState(null);
  const [onFleetGuru, setOnFleetGuru] = useState(false);
  const fleetguruRef = useRef(null);

  const { t } = useTranslation();
  const history = useHistory();
  const profileItemClassName = classNames("profile-item", {
    "active-menuitem fadeInDown": props.topbarUserMenuActive,
  });
  let logo_img_url = process.env.PUBLIC_URL + "/assets/layout/images/logo_aukai_light.png";
  let profile_img_url = process.env.PUBLIC_URL + "/user_img_placeholder.jpg";

  useEffect(() => {
    const userInfo = getUserInfo();
  
    setUserInfo(userInfo);
  }, []);

  
  
  useEffect(() => {
    if (!onFleetGuru) {
      fleetguruRef.current.hide();
    }
  }, [onFleetGuru]);
  
  return (
    <div className="topbar-sticky">
      <div className={`layout-topbar topbar-cont-outter " ${isMobileDevice() ? "p-pt-4" : ""}`}>
        <div className="topbar-left">
          <button type="button" className="menu-button p-link" onClick={props.onMenuButtonClick}>
            <i className="pi pi-chevron-left" />
          </button>
          <span className="topbar-separator" />
          <div
            className={`topbar-son ${onFleetGuru ? "topbar-son-active" : ""}`}
            onClick={(e) => {
              setOnFleetGuru(!onFleetGuru);
              fleetguruRef.current.toggle(e);
            }}
          >
            {onFleetGuru ? <img src={robotOn} alt="" /> : <img src={robotOff} alt="" />}
          </div>
          <img
            id="logo-mobile"
            className="mobile-logo logo-image"
            src={logo_img_url}
            alt="aukai_logo"
          />
        </div>
        <div className="topbar-right">
          <ul className="topbar-menu">
            <li className="topbar-greeting">
              {userInfo
                ? t("navigationBar.navigation_greeting", { username: userInfo.firstName })
                : t("navigationBar.navigation_greeting")}
            </li>
            <div
              className={`topbar-son
                ${props.assitantStatus ? "topbar-son-hide" : ""}
                ${onFleetGuru ? "topbar-son-active" : ""} 
              `}
              onClick={(e) => {
                setOnFleetGuru(!onFleetGuru);
                fleetguruRef.current.toggle(e);
              }}
            >
              {onFleetGuru ? <img src={robotOn} alt="" /> : <img src={robotOff} alt="" />}
            </div>
            {/* FLEET GURU DROPDOWN */}
            <OverlayPanel
              className="custom-fleet-guru"
              ref={fleetguruRef}
              style={{ width: "550px", right: "200px !important" }}
              breakpoints={{ "550px": "400px", "400px": "350px" }}
              onHide={() => setOnFleetGuru(false)}
            >
              <FleetGuru
                setOnFleetGuru={setOnFleetGuru}
                setAssistantStatus={props.setAssistantStatus}
              />
            </OverlayPanel>
            <li className="feedback-item" data-tip data-for="feedback-tooltip">
              <Button
                className="p-button-secondary p-d-none p-d-md-inline-flex"
                iconPos="right"
                onClick={() => history.push("/feedback")}
              >
                <img src={feedback} alt="" />
              </Button>
              <Button
                className="p-button-secondary p-d-md-none"
                iconPos="right"
                onClick={() => history.push("/feedback")}
              >
                <img src={feedback} alt="" />
              </Button>
            </li>
            <ReactTooltip className="topbar-tooltip" id="feedback-tooltip" place="bottom">
              {t("navigationBar.topbar_feedback")}
            </ReactTooltip>
            <li className={profileItemClassName}>
              <div className="main-btn">
                <button
                  type="button"
                  className="p-link p-d-flex p-ai-center"
                  onClick={props.onTopbarUserMenu}
                >
                  { props.userInfo.picUrl.toLowerCase() !== "na" 
                      ? <img src={props.userInfo.picUrl} alt="diamond-layout" className="profile-image" />
                      : <img src={profile_img_url} alt="diamond-layout" className="profile-image" />
                  }
                  <div className="profile-info">
                    <span className="profile-name">{props.userInfo.name}</span>
                    <i className="pi pi-chevron-down" />
                    <br />
                    {props.userInfo.role && (
                      <span className="profile-role">{props.userInfo.role}</span>
                    )}
                  </div>
                </button>
              </div>
              <ul className="profile-menu fade-in-up">
                <li>
                  <button
                    type="button"
                    className="p-link"
                    onClick={() => history.push("/account-options")}
                  >
                    <i className="pi pi-user" />
                    <span>Profile</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="p-link"
                    onClick={() => {
                      logout();
                      window.location = "/";
                    }}
                  >
                    <i className="pi pi-power-off" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AppTopbar;
