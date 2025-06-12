"use client";

import ReactSelect, { Props } from "react-select";
import { twMerge } from "tailwind-merge";

type SelectProps = Props & {
  label?: string;
  placeholder?: string;
  value?: Array<string> | string;
  containerClassName?: string;
  icon?: React.ReactNode;
};

export const Select = ({
  label,
  placeholder = "Select option...",
  options,
  value,
  containerClassName = "",
  icon = null,
  ...props
}: SelectProps) => {
  const composeValues = () => {
    const customizedValue = options?.[Array.isArray(value) ? "filter" : "find"](
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (option: any) =>
        Array.isArray(value)
          ? value?.includes(option?.value)
          : option?.value === value
    );

    return customizedValue;
  };

  return (
    <div className={twMerge("relative w-full", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <div className="flex items-center w-full relative">
        {icon && (
          <div className="flex items-center justify-center h-full absolute left-2.5 w-5 z-10">
            <div className="text-gray-400 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">
              {icon}
            </div>
          </div>
        )}
        <ReactSelect
          menuPortalTarget={document?.body}
          options={options}
          value={composeValues()}
          placeholder={placeholder}
          className="w-full"
          styles={{
            control(base, props) {
              return {
                ...base,
                width: "100%",
                height: "48px",
                minHeight: "48px",
                borderRadius: "0.5rem",
                borderColor: "#ebe6e7",
                "&:hover": { borderColor: "#ebe6e7" },
                ...(props?.isFocused && { boxShadow: "0 0 0 2px #51A2FF" }),
              };
            },
            valueContainer(base) {
              return {
                ...base,
                padding: icon ? "0 10px 0 35px" : "0 10px",
                height: "48px",
                display: "flex",
                alignItems: "center",
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
    </div>
  );
};
