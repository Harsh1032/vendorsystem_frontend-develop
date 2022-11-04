import React from "react";
import swal from "sweetalert";
import queryString from "query-string";
import * as Constants from "../../constants";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadingAlert, errorAlert } from "../ShareComponents/CommonAlert";
import { ConfirmDialog } from "primereact/confirmdialog";
import { sendPostRequest } from "../../helpers/HttpRequestHelper";
import "../../styles/LoginForm/newpwd.scss";
import "../../styles/dialogStyles.scss";

const RequestPwdConfirmation = (props) => {
  let history = useHistory();
  const { t } = useTranslation();

  const parsed = queryString.parse(props.location.search);
  const accept = () => {
    loadingAlert();

    const callback = (r) => {
      successAlert();
    };

    const errorHandler = (err) => {
      errorAlert(err.customErrorMsg, accept);
    };

    sendPostRequest(
      `${Constants.ENDPOINT_PREFIX}/api-auth/v1/User/password-reset-complete/`,
      {
        token: parsed.token,
        uidb64: parsed.uidb64,
      },
      {},
      callback,
      errorHandler
    );
  };

  const successAlert = () => {
    return swal({
      title: t("general.success"),
      text: t("loginForm.request_password_sent_text"),
      icon: "success",
      buttons: { return: t("general.return") },
    }).then((value) => {
      switch (value) {
        case "return":
          history.push("/");
          break;
        default:
          return;
      }
    });
  };

  return (
    <div className="new-pwd-wrapper">
      <div className="inner-wrapper">
        <ConfirmDialog
          visible
          className="custom-main-dialog"
          header={t("loginForm.request_password_header")}
          message={t("loginForm.request_password_body")}
          accept={accept}
          style={{ width: "40vw" }}
          breakpoints={{ "1280px": "40vw", "960px": "65vw", "768px": "80vw", "500px": "90vw" }}
        />
      </div>
    </div>
  );
};

export default RequestPwdConfirmation;
