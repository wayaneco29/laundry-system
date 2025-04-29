"use client";

import ReactSelect, { Props } from "react-select";

type SelectProps = Props & {
  label?: string;
  placeholder?: string;
};

export const Select = ({
  label,
  placeholder = "Select option...",
  options,
  ...props
}: SelectProps) => {
  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <ReactSelect
        menuPortalTarget={document.body}
        options={options}
        value={props?.value}
        placeholder={placeholder}
        styles={{
          control(base, props) {
            return {
              ...base,
              borderRadius: "0.5rem",
              borderColor: "#ebe6e7",
              "&:hover": { borderColor: "#ebe6e7" },
              ...(props?.isFocused && { boxShadow: "0 0 0 2px #51A2FF" }),
            };
          },
          valueContainer(base) {
            return {
              ...base,
              padding: "7.1px 10px",
            };
          },
          indicatorSeparator() {
            return {
              display: "none",
            };
          },
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          menuList(base) {
            return {
              ...base,
              color: "#364153",
              background: "white",
              borderRadius: "5px",
            };
          },
        }}
        {...props}
      />
    </div>
  );
};
