import { PropsWithChildren } from "react";

import { twMerge } from "tailwind-merge";

import { XMarkIcon } from "@heroicons/react/24/solid";

type ModalProps = {
  title: string;
  show: boolean;
  isSubmitting: boolean;
  onClose: () => void;
} & PropsWithChildren;

export const Modal = ({
  title,
  isSubmitting,
  show,
  onClose,
  children,
}: ModalProps) => {
  return (
    <>
      <div
        id="custom-modal"
        className={twMerge(
          "hs-overlay size-full fixed top-0 start-0 overflow-visible overflow-x-hidden overflow-y-auto pointer-events-none",
          show
            ? "open opened z-80"
            : "ease-in-out transition-all duration-200 opacity-0 pointer-events-none -z-50"
        )}
      >
        <div
          className={twMerge(
            "ease-in-out transition-all duration-200 sm:max-w-2xl m-3 sm:mx-auto min-h-[calc(100%-56px)] flex items-center",
            show ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="w-full flex flex-col bg-white shadow-2xs rounded-lg pointer-events-auto">
            <div className="flex justify-between items-center px-4 py-5 bg-blue-400 rounded-tl-lg rounded-tr-lg">
              <h3 className="font-medium text-white text-lg">{title}</h3>
              <button
                type="button"
                className="cursor-pointer"
                onClick={!isSubmitting ? onClose : undefined}
              >
                <XMarkIcon className="size-6 text-white" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto text-gray-700">{children}</div>
          </div>
        </div>
      </div>
      {show && (
        <div className="hs-overlay-backdrop z-[60] transition duration fixed inset-0 bg-gray-900/50" />
      )}
    </>
  );
};
