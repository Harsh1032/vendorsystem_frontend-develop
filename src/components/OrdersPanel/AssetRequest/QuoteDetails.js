import React from "react";
import moment from "moment";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import * as Constants from "../../../constants";
import LoadingAnimation from "../../ShareComponents/LoadingAnimation";

const QuoteDetails = ({ quote, dataReady }) => {
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
          {quote && quote.modified_by ? (
            <div
              className={`add-descr-section p-d-flex p-flex-column ${
                isMobile ? "main-details" : ""
              }`}
            >
              {isMobile && <hr />}
              <div className="p-d-flex p-jc-between">
                <span className="title font-weight-bold">
                  {t("assetOrderDetails.asset_order_quote")}
                </span>
              </div>

              <div className="p-mt-2 p-d-flex p-flex-column">
                <div className="p-d-flex p-jc-between">
                  <span className="sub-title">{`${t("general.estimated_cost")}:`}</span>
                  <span className="sub-value">
                    {quote.estimated_cost
                      ? quote.estimated_cost.toFixed(2)
                      : t("general.not_applicable")}
                  </span>
                </div>
                <div className="p-d-flex p-jc-between">
                  <span className="sub-title">{`${t("general.created_by")}:`}</span>
                  <span className="sub-value">
                    {quote.created_by ? quote.created_by : t("general.not_applicable")}
                  </span>
                </div>
                <div className="p-d-flex p-jc-between">
                  <span className="sub-title">{`${t("general.modified_by")}:`}</span>
                  <span className="sub-value">
                    {quote.modified_by ? quote.modified_by : t("general.not_applicable")}
                  </span>
                </div>
                <div className="p-d-flex p-jc-between">
                  <span className="sub-title">{`${t("general.date_created")}:`}</span>
                  <span className="sub-value">
                    {moment(quote.date_created).isValid()
                      ? moment(quote.date_created).format("YYYY-MM-DD")
                      : t("general.not_applicable")}
                  </span>
                </div>
                <div className="p-d-flex p-jc-between">
                  <span className="sub-title">{`${t("general.date_updated")}:`}</span>
                  <span className="sub-value">
                    {moment(quote.date_updated).isValid()
                      ? moment(quote.date_updated).format("YYYY-MM-DD")
                      : t("general.not_applicable")}
                  </span>
                </div>
              </div>
              {!isMobile && <hr />}
            </div>
          ) : null}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default QuoteDetails;
