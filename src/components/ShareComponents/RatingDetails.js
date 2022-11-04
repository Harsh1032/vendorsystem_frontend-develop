import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { Rating } from "primereact/rating";
import * as Constants from "../../constants";
import LoadingAnimation from "./LoadingAnimation";

function RatingDetails({ data, dataReady }) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MOBILE_BREAKPOINT}px)` });

  return (
    <React.Fragment>
      {!dataReady ? (
        <div className="p-mt-2">
          <LoadingAnimation height={"150px"} />
        </div>
      ) : (
        <React.Fragment>
          {data ? (
            <div
              className={`add-descr-section p-d-flex p-flex-column ${
                isMobile ? "main-details" : ""
              }`}
            >
              {isMobile && <hr />}
              <div className="p-d-flex p-jc-between">
                <span className="title font-weight-bold">{t("ratingDetails.title")}</span>
              </div>

              <div className="p-mt-2 p-d-flex p-flex-column">
                <div className="p-d-flex p-jc-between">
                  <span className="sub-title">{`${t("ratingDetails.rating")}:`}</span>
                  <span className="sub-value">
                    <Rating value={data.rating} readOnly stars={5} cancel={false} />
                  </span>
                </div>
              </div>
              <div className="p-d-flex p-flex-column">
                <span className="sub-title">{`${t("ratingDetails.feedback")}:`}</span>
                <span className="sub-value">{data.feedback}</span>
              </div>
              {!isMobile && <hr />}
            </div>
          ) : null}
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default RatingDetails;
