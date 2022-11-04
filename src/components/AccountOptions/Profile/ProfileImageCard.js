import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import * as Constants from "../../../constants";
import { CTRL_AUDIO_PLAY } from "../../../redux/types/audioTypes";
import { getAuthHeader } from "../../../helpers/Authorization";
import { sendPostRequest } from "../../../helpers/HttpRequestHelper";
import CustomInputText from "../../ShareComponents/CustomInputText";
import FileUploadInput from "../../ShareComponents/FileUploadInput";
import { loadingAlert, successAlert, generalErrorAlert } from "../../ShareComponents/CommonAlert";
import ConsoleHelper from "../../../helpers/ConsoleHelper";
import "../../../styles/dialogStyles.scss";
import "../../../styles/helpers/fileInput.scss";

const PasswordDialog = ({
  password,
  setPassword,
  matchError,
  emptyError,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  submitClicked,
  setSubmitClicked,
}) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div>
        <label htmlFor="currentPassword">{t("accountOptions.old_password_label")}</label>
        <CustomInputText
          required
          leftStatus
          type="password"
          className={`form-control ${submitClicked && !password && "is-invalid"}`}
          id="currentPassword"
          placeholder="Password"
          onChange={(val) => {
            setSubmitClicked(false);
            setPassword(val);
          }}
        />
      </div>
      <div className="p-mt-3">
        <label htmlFor="newPassword">{t("accountOptions.new_password_label")}</label>
        <CustomInputText
          required
          leftStatus
          type="password"
          className={`form-control ${
            submitClicked && (matchError || !newPassword) && "is-invalid"
          }`}
          id="newPassword"
          placeholder="New Password"
          onChange={(val) => {
            setSubmitClicked(false);
            setNewPassword(val);
          }}
        />
      </div>
      <div className="p-mt-3">
        <label htmlFor="confirmPassword">{t("accountOptions.new_password_again_label")}</label>
        <CustomInputText
          required
          leftStatus
          type="password"
          className={`form-control ${
            submitClicked && (matchError || !confirmPassword) && "is-invalid"
          }`}
          id="confirmPassword"
          placeholder="Confirm Password"
          onChange={(val) => {
            setSubmitClicked(false);
            setConfirmPassword(val);
          }}
        />
      </div>
      {submitClicked && matchError && (
        <div className="invalid-feedback">{t("accountOptions.passwords_match_error")}</div>
      )}
      {submitClicked && emptyError && (
        <div className="invalid-feedback">{t("accountOptions.passwords_empty_error")}</div>
      )}
    </React.Fragment>
  );
};

const ImageDialog = ({ selectedFile, setSelectedFile, fileLoading, setFileLoading }) => {
  const [imageFileName, setImageFileName] = useState("");

  return (
    <div className="custom-file input-files-container">
      <FileUploadInput
        images={selectedFile}
        setImages={setSelectedFile}
        imageNames={imageFileName}
        setImageNames={setImageFileName}
        fileLoading={fileLoading}
        setFileLoading={setFileLoading}
      />
      <div className="p-d-flex p-jc-end" />
    </div>
  );
};

const ProfileImageCard = ({ userInfo, setDataReady }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [changeImageDialog, setChangeImageDialog] = useState(false);
  const [changePwdDialog, setChangePwdDialog] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(false);
  const [selectedFile, setSelectedFile] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);

  const handlePasswordChange = () => {
    const authHeader = getAuthHeader();

    const callback = (r) => {
      setChangePwdDialog(false);
      successAlert("msg", t("accountOptions.password_update_success"));
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "success_alert" });
    };

    const errorHandler = (err) => {
      generalErrorAlert(err.customErrorMsg);
      dispatch({ type: CTRL_AUDIO_PLAY, payload: "error_alert" });
    };

    sendPostRequest(
      `${Constants.ENDPOINT_PREFIX}/api-auth/v1/User/Update/Password`,
      { password: newPassword },
      authHeader,
      callback,
      errorHandler
    );
  };

  const validatePassword = () => {
    dispatch({ type: CTRL_AUDIO_PLAY, payload: "submit" });
    setSubmitClicked(true);
    if (newPassword === confirmPassword && newPassword && confirmPassword && password) {
      loadingAlert();

      const callback = (r) => {
        handlePasswordChange();
      };

      const errorHandler = (e) => {
        generalErrorAlert(e.customErrorMsg);
      };

      sendPostRequest(
        `${Constants.ENDPOINT_PREFIX}/api-auth/v1/Login`,
        {
          email: userInfo.email,
          password: password,
        },
        {},
        callback,
        errorHandler
      );
    }
  };

  const handleSubmission = () => {
    setUploadStatus(true);
    const imageData = new FormData();
    imageData.append("image", selectedFile[0]);

    const callback = (res) => {
      setUploadStatus(false);
      setDataReady(false);
      setChangeImageDialog(false);
    };

    const errorHandler = (error) => {
      generalErrorAlert(error.customErrorMsg);
      setUploadStatus(false);
      ConsoleHelper(error);
    };

    sendPostRequest(
      `${Constants.ENDPOINT_PREFIX}/api-auth/v1/User/Update/Image`,
      imageData,
      getAuthHeader(),
      callback,
      errorHandler
    );
  };

  let matchError =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword;
  let emptyError = !newPassword || !confirmPassword || !password;

  const footerImg = (
    <div>
      <Button
        onClick={handleSubmission}
        className="btn btn-secondary mt-4"
        disabled={selectedFile.length === 0 || uploadStatus || fileLoading}
      >
        {!uploadStatus ? (
          t("general.submit")
        ) : (
          <div>
            <span
              className="spinner-border spinner-border-sm mr-1"
              role="status"
              aria-hidden="true"
            />
            {t("accountOptions.uploading_status_label")}
          </div>
        )}
      </Button>
    </div>
  );

  const footerPwd = (
    <div>
      <Button
        onClick={validatePassword}
        className="btn btn-secondary mt-4"
        disabled={submitClicked && (matchError || emptyError)}
      >
        {t("general.submit")}
      </Button>
    </div>
  );
  
  return (
    <div className="profile-left">
      <div className="p-d-flex p-py-2 justify-content-center">
        <div className="p-d-flex p-flex-column">
          <div className="profile-user-info-avatar">
            <img
              alt="user_image"
              src={userInfo.imageUrl}
              className="profile-user-info-avatar-img"
            />
            <button
              className="profile-img-btn change-button change-settings"
              onClick={() => setChangeImageDialog(true)}
            >
              <i className="pi pi-camera">{""}</i>
            </button>
          </div>
          <h4 className="text-center text-name p-mt-3">{userInfo.name || "N/A"}</h4>
          <h5 className="text-center text-role p-mb-4">{userInfo.company}</h5>
        </div>
      </div>
      <div className="p-d-flex p-flex-column p-0 align-items-center">
        <Dialog
          className="custom-main-dialog"
          baseZIndex={1000}
          header="Change Profile Image"
          visible={changeImageDialog}
          footer={footerImg}
          onHide={() => setChangeImageDialog(false)}
          style={{ width: "40vw" }}
          breakpoints={{ "1280px": "40vw", "960px": "60vw", "768px": "80vw" }}
        >
          <ImageDialog
            setDataReady={setDataReady}
            setChangeImageDialog={setChangeImageDialog}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            fileLoading={fileLoading}
            setFileLoading={setFileLoading}
          />
        </Dialog>

        <button
          className="profile-pass-btn change-button change-settings bg-secondary"
          onClick={() => setChangePwdDialog(true)}
        >
          <i className="pi pi-pencil p-mr-2">{""}</i>
          {t("accountOptions.change_password")}
        </button>
        <Dialog
          className="custom-main-dialog"
          baseZIndex={1000}
          header="Change Profile Password"
          visible={changePwdDialog}
          footer={footerPwd}
          onHide={() => setChangePwdDialog(false)}
          style={{ width: "30vw" }}
          breakpoints={{ "1280px": "40vw", "960px": "60vw", "768px": "80vw" }}
        >
          <PasswordDialog
            userInfo={userInfo}
            setChangePwdDialog={setChangePwdDialog}
            password={password}
            setPassword={setPassword}
            matchError={matchError}
            emptyError={emptyError}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            submitClicked={submitClicked}
            setSubmitClicked={setSubmitClicked}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default ProfileImageCard;
