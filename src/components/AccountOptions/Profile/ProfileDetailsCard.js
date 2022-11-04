import React from "react";
import { useTranslation } from "react-i18next";
import InfoCard from "../../ShareComponents/InfoCard";

const ProfileDetailsCard = ({ userInfo }) => {
  const { t } = useTranslation();

  const ProfileRow = ({ title, info }) => {
    return (
      <div className="profile-item-wrapper">
        <div className="p-d-flex p-flex-wrap p-jc-between">
          <div className="profile-item-title">{title}:</div>
          <div className="profile-item-value">{info || "N/A"}</div>
        </div>
        <hr />
      </div>
    );
  };

  return (
    <InfoCard>
      <div className="d-flex flex-row no-gutters pt-2 pb-2 justify-content-start fleet-card-title">
        <h5 className="chart-card-title font-weight-bold">{t("accountOptions.account_details")}</h5>
      </div>
      <ProfileRow title={t("accountOptions.profile_name")} info={userInfo.name} />
      <ProfileRow title={t("accountOptions.profile_email")} info={userInfo.email} />
      <ProfileRow title={t("accountOptions.profile_phone_number")} info={userInfo.phone_number} />
      <ProfileRow title={t("accountOptions.profile_address")} info={userInfo.address} />
      <ProfileRow
        title={t("accountOptions.profile_green_initiatives")}
        info={userInfo.green_initiatives}
      />
      <ProfileRow title={t("accountOptions.profile_join_date")} info={userInfo.joinDate} />
      <ProfileRow title={t("accountOptions.profile_last_login")} info={userInfo.lastLogin} />
    </InfoCard>
  );
};

export default ProfileDetailsCard;
