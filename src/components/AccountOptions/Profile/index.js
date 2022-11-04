import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import * as Constants from "../../../constants";
import { getAuthHeader } from "../../../helpers/Authorization";
import { getUserInformation } from "../../../redux/actions/apiCallAction";
import { sendGetRequests } from "../../../helpers/HttpRequestHelper";
import PanelHeader from "../../ShareComponents/helpers/PanelHeader";
import Spinner from "../../ShareComponents/Spinner";
import ProfileImageCard from "./ProfileImageCard";
import ProfileDetailsCard from "./ProfileDetailsCard";
import { generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import "../../../styles/AccountOptions/profile.scss";

const Profile = () => {
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });
  const { userInfo } = useSelector((state) => state.apiCallData);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [dataReady, setDataReady] = useState(true);
  const [userInformation, setUserInfo] = useState(null);

  useEffect(() => {
    if (userInfo) {
      setUserInfo({
        name: userInfo.user.first_name + " " + userInfo.user.last_name,
        email: userInfo.user.username,
        phone_number: userInfo.detailed_user.company?.company_phone || t("general.not_applicable"),
        address: userInfo.detailed_user.company?.company_address || t("general.not_applicable"),
        company: userInfo.detailed_user.company?.company_name || t("general.not_applicable"),
        green_initiatives:
          userInfo.detailed_user.company?.vendor_green_rating || t("general.not_applicable"),
        joinDate:
          moment(userInfo.user.date_joined).format("YYYY-MM-DD") || t("general.not_applicable"),
        lastLogin:
          moment(userInfo.user.last_login).format("YYYY-MM-DD") || t("general.not_applicable"),
        imageUrl: 
          userInfo.detailed_user.image_url &&
          userInfo.detailed_user.image_url.toLowerCase() !== "na"
            ? userInfo.detailed_user.image_url
            : process.env.PUBLIC_URL + "/user_img_placeholder.jpg",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);
  
  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();

    if (!dataReady) {
      const callback = (result, status) => {
        if (status === "fulfilled") {
          const userInfoResponse = !!result ? result.data : 0;
          if (userInfoResponse) {
            const aux_data = userInfo.aux_data;
            dispatch(getUserInformation({ ...result.data, aux_data }));
          }
        } else if (status === "rejected") {
          generalErrorAlert(t("accountOptions.profile_update_error"));
        }
        setDataReady(true);
      };

      const errorHandler = (err) => {
        ConsoleHelper(err);
      };

      sendGetRequests(
        [`${Constants.ENDPOINT_PREFIX}/api-auth/v1/User/Info`],
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
    // eslint-disable-next-line
  }, [dataReady]);

  return (
    <div className="profile-page">
      <div className={`header-container p-mx-5 ${!isMobile ? "p-mt-5" : "p-mt-2"}`}>
        <PanelHeader icon={faUser} text={t("accountOptions.profile_title")} disableBg />
      </div>
      {dataReady && userInformation ? (
        <React.Fragment>
          <div className="row profile-cont">
            <div className="col-sm col-img">
              <ProfileImageCard userInfo={userInformation} setDataReady={setDataReady} />
            </div>
            <div className="col-sm col-chart">
              <ProfileDetailsCard userInfo={userInformation} />
            </div>
          </div>
        </React.Fragment>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Profile;
