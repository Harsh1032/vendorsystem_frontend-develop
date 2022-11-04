import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import ReactTooltip from "react-tooltip";
import "../../../styles/tooltipStyles.scss";

const Tooltip = ({ label, description, hidden, size = 18, styles = {} }) => {
  return (
    <div hidden={hidden} className="pl-2 form-tooltip" style={{ display: "inline", ...styles }}>
      <AiOutlineInfoCircle size={size} data-tip data-for={label} />
      <ReactTooltip id={label} place="right">
        {description}
      </ReactTooltip>
    </div>
  );
};

export default Tooltip;
