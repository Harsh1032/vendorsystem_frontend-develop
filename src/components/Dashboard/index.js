import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Button } from "primereact/button";
import * as Constants from "../../constants";
import DashboardHeader from "./DashboardHeader";
import "../../styles/helpers/button3.scss";
import "../../styles/Dashboard/dashboard.scss";

const Dashboard = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.apiCallData);
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });

  const userInformation = {
    first_name: userInfo.user.first_name,
  };

  const onChangePage = (url) => {
    history.push(url);
  };

  return (
    <div>
      {!isMobile ? (
        <DashboardHeader userInfo={userInformation} isOperator />
      ) : (
        <div className="dashboard-mobile-header">
          <div className="subheader-1">
            {t("general.welcome_back_userInfo_name", {
              userInfo_name: userInformation.first_name,
            })}
          </div>
          <div className="subheader-2">{t("general.greeting_msg")}</div>
        </div>
      )}
      <div className="dashboard-panel p-d-flex p-jc-around p-flex-wrap">
        <div className="access-container img-orders" onClick={() => onChangePage("/orders")}>
          <div className="footer-btn">
            <div className="btn-3 p-mr-4">
              <Button
                label={t("navigationItems.orders")}
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={() => onChangePage("/orders")}
              />
            </div>
          </div>
        </div>
        <div className="access-container img-pricing" onClick={() => onChangePage("/pricing")}>
          <div className="footer-btn">
            <div className="btn-3 p-mr-4">
              <Button
                label={t("navigationItems.pricing")}
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={() => onChangePage("/pricing")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
