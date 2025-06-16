import { PropsWithChildren, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { XMarkIcon } from "@heroicons/react/24/solid";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

type ModalProps = {
  title: string | ReactNode;
  show: boolean;
  isSubmitting?: boolean;
  size?: ModalSize;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onClose: () => void;
} & PropsWithChildren;

const sizeClasses: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  full: "sm:max-w-full sm:m-0",
};

export const Modal = ({
  title,
  isSubmitting = false,
  show,
  size = "2xl",
  closeOnEscape = true,
  closeOnBackdrop = true,
  showCloseButton = true,
  className,
  headerClassName,
  bodyClassName,
  onClose,
  children,
}: ModalProps) => {
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape && show) {
        handleClose();
      }
    },
    [closeOnEscape, show, handleClose]
  );

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (
        closeOnBackdrop &&
        event.target === event.currentTarget &&
        !isSubmitting
      ) {
        handleClose();
      }
    },
    [closeOnBackdrop, isSubmitting, handleClose]
  );

  useEffect(() => {
    if (show) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [show, handleEscapeKey]);

  if (!show) return null;

  const modalContent = (
    <div
      className={twMerge(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "animate-in fade-in-0 duration-200"
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={twMerge(
          "relative w-full bg-white shadow-xl rounded-lg pointer-events-auto",
          "animate-in zoom-in-95 duration-200",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={twMerge(
            "flex justify-between items-center px-6 py-4 bg-blue-500 rounded-t-lg",
            headerClassName
          )}
        >
          <h3
            id="modal-title"
            className="font-semibold text-white text-lg leading-6"
          >
            {title}
          </h3>
          {showCloseButton && (
            <button
              type="button"
              className={twMerge(
                "p-1 rounded-full hover:bg-blue-600 transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Body */}
        <div
          className={twMerge(
            "p-6 overflow-y-auto max-h-[calc(100vh-200px)]",
            "text-gray-900",
            bodyClassName
          )}
        >
          {children}
        </div>

        {/* Loading overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/50 -z-10" />
    </div>
  );

  return createPortal(modalContent, document.body);
};
