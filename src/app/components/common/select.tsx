"use client";

import ReactSelect, { Props } from "react-select";
import { twMerge } from "tailwind-merge";

type SelectProps = Props & {
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: Array<string> | string;
  containerClassName?: string;
  icon?: React.ReactNode;
  error?: boolean;
};

export const Select = ({
  label,
  disabled = false,
  error = false,
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
        <label className="block text-sm text-gray-600 font-medium mb-2">
          {label}
        </label>
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
          isDisabled={disabled}
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
                height: "42px",
                minHeight: "42px",
                borderRadius: "0.5rem",
                borderColor: error ? "red" : "#ebe6e7",
                fontSize: "0.875rem",
                color: "#111827",
                "&::placeholder": {
                  color: "#6b7280",
                  fontSize: "0.875rem",
                },
                "&:hover": { borderColor: error ? "red" : '"#ebe6e7"' },
                ...(props?.isFocused && {
                  boxShadow: error ? "0 0 0 2px red" : "0 0 0 2px #51A2FF",
                }),
              };
            },
            placeholder(base) {
              return {
                ...base,
                color: "#6b7280",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                height: "42px",
              };
            },
            valueContainer(base) {
              return {
                ...base,
                padding: icon ? "0 10px 0 35px" : "0 10px",
                height: "42px",
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
      </div>{" "}
      {error && (
        <p className="mt-1 text-xs text-red-600">
          {typeof error === "string" ? error : "This field is required"}
        </p>
      )}
    </div>
  );
};
