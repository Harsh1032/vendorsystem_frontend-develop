import React from "react";
import { Dropdown } from "primereact/dropdown";
import "../../styles/ShareComponents/CustomFilterDropdown.scss";

const CustomFilterDropdown = ({ options, value, onChange, className, showClear }) => {
  const selectedItemTemplate = (option, props) => {
    if (option) {
      return (
        <div className="template-item template-item-value">
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const itemOptionTemplate = (option) => {
    return (
      <div className="template-item">
        <div>{option.name}</div>
      </div>
    );
  };

  return (
    <div className={className}>
      <Dropdown
        panelClassName="custom-filter-dropdown"
        className="custom-filter-dropdown-box"
        value={value ? options.find((el) => el.code === value) : null}
        options={options}
        onChange={onChange}
        optionLabel="name"
        filter
        showClear={showClear}
        filterBy="name"
        placeholder="Select a Client"
        valueTemplate={selectedItemTemplate}
        itemTemplate={itemOptionTemplate}
      />
    </div>
  );
};

export default CustomFilterDropdown;
