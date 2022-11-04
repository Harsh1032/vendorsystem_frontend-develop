import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import * as Constants from "../../constants";
import logo from "./img/logo_aukai_white@2x.png";
import { CTRL_AUDIO_PLAY } from "../../redux/types/audioTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CustomInputText from "../ShareComponents/CustomInputText";
import ErrorBoundary from "../ShareComponents/ErrorBoundary";
import { setAuthHeader } from "../../helpers/Authorization";
import {
  loadingAlert,
  successAlert,
  errorAlert,
  generalErrorAlert,
} from "../ShareComponents/CommonAlert";
import loginVideo from "./video/aukai-login.mp4";
import loginVideoMobile from "./video/mobile_login_vid.mp4";
import loadingVideo from "./video/aukai-loading.mp4";
import { sendPostRequest } from "../../helpers/HttpRequestHelper";
import { getInitInfo } from "../../redux/actions/apiCallAction";
import { AUDIO_DATA_UPDATE } from "../../redux/types/audioTypes";
import { RESET_INIT_DATA } from "../../redux/types/apiCallTypes";
import { RESET_WEATHER_DATA } from "../../redux/types/weatherTypes";
import "../../styles/LoginForm/login.scss";
import "../../styles/dialogStyles.scss";

const LoginForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [forgotpwdEmail, setForgotpwdEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwdShow, setPwdShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPwdDialog, setForgotPwdDialog] = useState(false);
  const { sound } = useSelector((state) => state.ctrlAudios);
  const isMobileBg = useMediaQuery({ query: `(max-width: 700px)` });

  useEffect(() => {
    dispatch({ type: AUDIO_DATA_UPDATE, sound: false });
    dispatch({ type: RESET_INIT_DATA });
    dispatch({ type: RESET_WEATHER_DATA });
  }, [dispatch]);

  const handleLogin = (event) => {
    event.preventDefault();
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "sign_in_audio" });
    if (email && password) {
      setLoading(true);

      const callback = (r) => {
        dispatch(getInitInfo(r.data));
        setAuthHeader(r.data.access, r.data.refresh, r.data.token_expiration, r.data.user);
        window.location.href = "/dashboard";
      };

      const errorHandler = (err) => {
        setLoading(false);
        setError(t("loginForm.incorrect_information"));
      };

      sendPostRequest(
        `${Constants.ENDPOINT_PREFIX}/api-auth/v1/Login`,
        {
          email: email,
          password: password,
        },
        {},
        callback,
        errorHandler
      );
    } else if (email) {
      setError(t("loginForm.incorrect_information"));
    } else {
      setError(t("loginForm.info_not_provided"));
    }
  };

  const handleSubmit = () => {
    if (!forgotpwdEmail.match(/.+@.+/)) {
      generalErrorAlert(t("loginForm.email_invalid_msg"));
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
    } else {
      loadingAlert();

      const callback = (r) => {
        successAlert("msg", t("loginForm.forgot_password_email_sent_text"));
        dispatch({ type: CTRL_AUDIO_PLAY, payload: "success_alert" });
        setForgotpwdEmail("");
      };

      const errorHandler = (error) => {
        errorAlert(error.customErrorMsg, handleSubmit);
        dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
      };

      sendPostRequest(
        `${Constants.ENDPOINT_PREFIX}/api-auth/v1/User/Forgot/Password`,
        {
          email: forgotpwdEmail,
          redirect_url: "",
        },
        {},
        callback,
        errorHandler
      );
    }
  };

  const renderFooter = () => {
    return (
      <Button
        label="Submit"
        icon="pi pi-check"
        onClick={() => {
          setForgotPwdDialog(false);
          handleSubmit();
        }}
        disabled={!forgotpwdEmail}
      />
    );
  };

  return (
    <ErrorBoundary>
      {loading ? (
        <div
          className="loading-video"
          style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
        >
          <video style={{ width: "100vw" }} autoPlay muted loop>
            <source src={loadingVideo} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div className="w-100 login-wrapper">
          {isMobileBg && (
            <video playsInline autoPlay muted loop className="mobile-login-vid">
              <source src={loginVideoMobile} type="video/mp4" />
            </video>
          )}
          <div className="login-card p-d-flex p-flex-wrap p-jc-center p-ai-center w-100 w-md-auto min-vh-100 p-px-3">
            <div className="wrap-login shadow">
              <form className="form-signin" onSubmit={handleLogin}>
                <div className="login_logo">
                  <img src={logo} alt="" width="240" />
                </div>
                {error && <p className="text-danger">{error}</p>}
                <div className="login-info-cont">
                  <span className="login-email">{t("loginForm.username_label")}</span>
                  <input
                    type="email"
                    className={`login-input-email ${error && "login-input-email-error"}`}
                    required
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (event.nativeEvent.inputType === "insertText") setError("");
                    }}
                  />
                </div>
                <div className="login-info-cont">
                  <span className="login-pass">{t("loginForm.password_label")}</span>
                  <div className="pass-wrapper">
                    <input
                      type={pwdShow ? "text" : "password"}
                      className={`login-input-pass ${error && "login-input-pass-error"}`}
                      required
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (event.nativeEvent.inputType === "insertText") setError("");
                      }}
                    />
                    <div className="login-input-pass-icon" onClick={() => setPwdShow(!pwdShow)}>
                      <FontAwesomeIcon icon={pwdShow ? faEyeSlash : faEye} color="white" />
                    </div>
                  </div>
                </div>
                <div className="al-left">
                  <Button
                    type="button"
                    label={t("loginForm.forgot_password_link")}
                    className="p-button-link text-dark login-4gotpass-btn"
                    onClick={() => setForgotPwdDialog(true)}
                  />
                </div>
                <button
                  className="btn btn-lg btn-aukai btn-block"
                  type="submit"
                  id="submitButton"
                  disabled={loading}
                >
                  {t("loginForm.sign_in_button")}
                </button>
                <Dialog
                  className="custom-main-dialog"
                  baseZIndex={100}
                  header={t("loginForm.forgot_password_link")}
                  visible={forgotPwdDialog}
                  footer={renderFooter}
                  onHide={() => {
                    setForgotPwdDialog(false);
                    setForgotpwdEmail("");
                  }}
                  style={{ width: "40vw" }}
                  breakpoints={{
                    "1280px": "40vw",
                    "960px": "65vw",
                    "768px": "80vw",
                    "500px": "90vw",
                  }}
                >
                  <div className="p-d-flex p-ai-center p-jc-between row">
                    <span className={`${isMobileBg ? "col-12" : "col-6"}`}>
                      {t("loginForm.username_placeholder")}:
                    </span>
                    <div className={`p-my-1 ${isMobileBg ? "col-12" : "col-6"}`}>
                      <CustomInputText
                        className="w-100"
                        value={forgotpwdEmail}
                        onChange={setForgotpwdEmail}
                        status={forgotpwdEmail}
                        leftStatus
                      />
                    </div>
                  </div>
                </Dialog>
              </form>
              <div className="login-more d-none d-sm-none d-md-block">
                {!isMobileBg && (
                  <video autoPlay muted loop>
                    <source src={loginVideo} type="video/mp4" />
                  </video>
                )}
                <div className="bg-text">
                  <p className=" mb-3 text-light">{t("loginForm.promo_text")}</p>
                </div>
              </div>
            </div>
            <div className="sound-switch">
              <div>
                {t("settings.sound")}:{" "}
                <Button
                  onClick={() => {
                    localStorage.setItem("sound", 1);
                    dispatch({ type: AUDIO_DATA_UPDATE, sound: true });
                  }}
                  label={t("general.on")}
                  className={`p-button-link sound-switch-btn ${sound && "sound-on"}`}
                />
                <span className="separator">|</span>
                <Button
                  onClick={() => {
                    localStorage.setItem("sound", 0);
                    dispatch({ type: AUDIO_DATA_UPDATE, sound: false });
                  }}
                  label={t("general.off")}
                  className={`p-button-link sound-switch-btn ${!sound && "sound-on"}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default LoginForm;
