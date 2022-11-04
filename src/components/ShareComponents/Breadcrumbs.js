import React from "react";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../styles/ShareComponents/Breadcrumbs.scss";

const Breadcrumbs = ({ module, tabLabel, tabIcon, orderID }) => {
  return (
    <div className="link-order p-d-flex p-flex-wrap mt-3">
      <Button className="p-button-link" label={module} icon="pi pi-angle-right" iconPos="right" />
      <div className="p-d-flex p-ai-center">
        <FontAwesomeIcon icon={tabIcon} className="tab-icon" />
        {orderID ? (
          <Button
            className="p-button-link"
            label={tabLabel}
            icon="pi pi-angle-right"
            iconPos="right"
          />
        ) : (
          <Button className="p-button-link" label={tabLabel} />
        )}
      </div>
      {orderID && <Button className="p-button-link" label={orderID} />}
    </div>
  );
};

export default Breadcrumbs;
