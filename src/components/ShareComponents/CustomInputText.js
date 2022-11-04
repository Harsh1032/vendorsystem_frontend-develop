import React from "react";
import { InputText } from "primereact/inputtext";
import "../../styles/ShareComponents/CustomInputText.scss";

const CustomInputText = ({ classnames, type, placeholder = "", value, onChange, leftStatus, keyfilter }) => {
  return (
    <div className={`
      custom-input-text
      ${leftStatus ? "left-status" : ""} 
      ${classnames ? classnames : ""}`}
    >
      <InputText
        type={type}
        placeholder={placeholder}
        value={value}
        keyfilter={keyfilter}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default CustomInputText;
