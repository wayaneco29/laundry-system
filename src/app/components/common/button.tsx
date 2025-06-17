import {
  ButtonHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  forwardRef,
} from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 border-transparent",
  secondary:
    "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500 border-transparent",
  outline:
    "bg-transparent text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white focus:ring-blue-500",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border-transparent",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "py-2 px-3 text-xs",
  md: "py-2.5 px-4 text-sm",
  lg: "py-3 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = "button",
      variant = "primary",
      size = "md",
      className = "",
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={twMerge(
          // Base styles
          "inline-flex items-center justify-center gap-2 font-medium rounded-lg border cursor-pointer transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",

          // Variant styles
          variantClasses[variant],

          // Size styles
          sizeClasses[size],

          // Full width
          fullWidth && "w-full",

          // Custom className
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="flex-shrink-0 w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">
            {leftIcon}
          </span>
        )}

        {/* Button text */}
        {children && (
          <span className={twMerge(loading && "ml-2")}>{children}</span>
        )}

        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="flex-shrink-0 w-4 h-4">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
