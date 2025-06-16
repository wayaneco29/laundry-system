import { ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  label?: string;
  containerClassName?: string;
  icon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, containerClassName = "", className = "", icon, ...props },
    ref
  ) => {
    return (
      <div className={twMerge("w-full", containerClassName)}>
        {label && (
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            {label}
          </label>
        )}

        <div
          className={twMerge(
            "relative w-full border rounded-lg transition-all duration-200 bg-white",
            "hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100",
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
              : "border-gray-200"
          )}
        >
          <div className="flex items-center">
            {icon && (
              <div className="flex items-center justify-center h-full absolute left-2.5 w-5">
                <div className="text-gray-400 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">
                  {icon}
                </div>
              </div>
            )}

            <input
              ref={ref}
              className={twMerge(
                "flex-1 py-3 pr-3 bg-transparent text-sm text-gray-900 placeholder-gray-500 h-full",
                "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                icon ? "pl-[35px]" : "pl-3",
                className
              )}
              {...props}
            />
          </div>
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-600">
            {typeof error === "string" ? error : "This field is required"}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
