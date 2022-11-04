import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import RequestProgress from "../RequestProgress";
import LoadingAnimation from "../LoadingAnimation";
import "../../../styles/ShareComponents/DetailsView/DetailsView.scss";

const DetailsView = ({
  headers,
  titles,
  values,
  description,
  additionalDescr,
  files,
  otherItemsBefore,
  editBtn,
  disableEditBtn,
  onEdit,
  actionBtn1,
  disableActionBtn1,
  onActionBtn1,
  actionBtn2,
  disableActionBtn2,
  onActionBtn2,
  btnGroup,
  progressSteps,
  progressContents,
  progressActive,
  onHideDialog,
  enableMore,
  setMoreDetails,
  detailsReady,
}) => {
  const { t } = useTranslation();

  const detailsViewHeader = () => {
    return (
      <div className="custom-detail-view-header">
        <h2 className="font-weight-bold">{headers[0]}</h2>
        {headers[1] && <h4>{headers[1]}</h4>}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <React.Fragment>
        {enableMore ? (
          <Button
            label={t("general.view_more_details")}
            className="p-button-link"
            onClick={() => setMoreDetails()}
          />
        ) : (
          <React.Fragment>{""}</React.Fragment>
        )}
      </React.Fragment>
    );
  };

  const fileGroups = {};
  for (let file of files) {
    if (!Object.keys(fileGroups).includes(file.file_purpose)) {
      fileGroups[file.file_purpose] = [];
    }
    fileGroups[file.file_purpose].push(file);
  }

  return (
    <Dialog
      className="custom-detail-view"
      header={detailsViewHeader}
      visible
      position={"right"}
      modal
      style={{ width: "540px" }}
      footer={renderFooter}
      onHide={() => onHideDialog(null)}
      draggable={false}
      resizable={false}
    >
      {detailsReady === undefined || (detailsReady !== undefined && detailsReady) ? (
        <React.Fragment>
          <div className="p-d-flex p-flex-column">
            {titles &&
              titles.map((title, index) => {
                return (
                  <div key={index}>
                    <div className="p-d-flex p-jc-between">
                      <span className="font-weight-bold">{title}</span>
                      <span>{values[index]}</span>
                    </div>
                    <hr className="solid" />
                  </div>
                );
              })}
          </div>
          {description && (
            <div className="p-d-flex p-flex-column">
              <span className="font-weight-bold">{description[0]}</span>
              <span>{description[1]}</span>
              {description[2] && <span>{description[2]}</span>}
              <hr className="solid" />
            </div>
          )}
          {additionalDescr && <div>{additionalDescr}</div>}
          {Object.keys(fileGroups).length !== 0 ? (
            <div className="p-d-flex p-flex-column">
              <span className="font-weight-bold">{t("general.attached_files")}</span>
              {Object.keys(fileGroups).map((groupName, i) => {
                return fileGroups[groupName].map((file, j) => {
                  return (
                    <React.Fragment key={j}>
                      {j === 0 && <span className="capitalize">{groupName} : </span>}
                      <span className="p-pb-1 p-ml-4" key={`${i}-${j}`}>
                        <a target="_blank" rel="noopener noreferrer" href={file.file_url}>
                          {file.file_name}
                        </a>
                      </span>
                    </React.Fragment>
                  );
                });
              })}
              <hr className="solid" />
            </div>
          ) : null}
          {(otherItemsBefore || editBtn || actionBtn1 || actionBtn2 || btnGroup) && (
            <div className="p-mt-2 p-d-flex p-flex-column">
              <h3 className="font-weight-bold">{t("general.quick_actions")}</h3>
              {otherItemsBefore}
              {editBtn && (
                <div className="p-mt-3 p-d-flex p-jc-center detail-edit-btn">
                  <Button
                    style={{ width: "370px" }}
                    icon="pi pi-pencil"
                    label={editBtn}
                    onClick={() => onEdit()}
                    disabled={disableEditBtn}
                  />
                </div>
              )}
              {actionBtn1 && (
                <div className={`p-mt-3 p-d-flex p-jc-center ${actionBtn1[2]}`}>
                  <Button
                    style={{ width: "370px" }}
                    icon={`pi ${actionBtn1[1]}`}
                    label={actionBtn1[0]}
                    onClick={() => onActionBtn1()}
                    disabled={disableActionBtn1}
                  />
                </div>
              )}
              {actionBtn2 && (
                <div className={`p-mt-3 p-d-flex p-jc-center ${actionBtn2[2]}`}>
                  <Button
                    style={{ width: "370px" }}
                    icon={`pi ${actionBtn2[1]}`}
                    label={actionBtn2[0]}
                    onClick={() => onActionBtn2()}
                    disabled={disableActionBtn2}
                  />
                </div>
              )}
              {btnGroup}
            </div>
          )}
          {progressSteps && (
            <div className="p-mt-5">
              {(editBtn || actionBtn1 || actionBtn2) && <hr />}
              <h3 className="font-weight-bold">{t("requestProgress.tab_title")}</h3>
              <div className="p-mt-5 p-mx-5">
                <RequestProgress
                  steps={progressSteps}
                  contents={progressContents}
                  activeStep={progressActive}
                  layout="vertical"
                />
              </div>
            </div>
          )}
        </React.Fragment>
      ) : (
        <LoadingAnimation height={"480px"} />
      )}
    </Dialog>
  );
};

export default DetailsView;
