import React from "react";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";

const ActionGroup = ({ onAccept, onReject, isMobile, disabled }) => {
  const { t } = useTranslation();
  return isMobile ? (
    <>
      <div className={`button-container detail-action-color-1`}>
        <Button
          className="w-100"
          icon={`pi pi-check-circle`}
          label={t("approvalDetails.accept_btn")}
          onClick={onAccept}
          disabled={disabled}
        />
      </div>
      <div className={`button-container detail-action-color-3`}>
        <Button
          className="w-100"
          icon={`pi pi-times-circle`}
          label={t("approvalDetails.reject_btn")}
          onClick={onReject}
          disabled={disabled}
        />
      </div>
    </>
  ) : (
    <>
      <div className={`p-mt-3 p-d-flex p-jc-center detail-action-color-1`}>
        <Button
          style={{ width: "370px" }}
          icon={`pi pi-check-circle`}
          label={t("approvalDetails.accept_btn")}
          onClick={onAccept}
          disabled={disabled}
        />
      </div>
      <div className={`p-mt-3 p-d-flex p-jc-center detail-action-color-3`}>
        <Button
          style={{ width: "370px" }}
          icon={`pi pi-times-circle`}
          label={t("approvalDetails.reject_btn")}
          onClick={onReject}
          disabled={disabled}
        />
      </div>
    </>
  );
};

export default ActionGroup;
