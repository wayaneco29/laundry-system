"use client";

import { SelectHTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type SelectProps = PropsWithChildren<
  SelectHTMLAttributes<HTMLSelectElement>
> & {
  label?: string;
  error?: boolean;
  shouldStick?: boolean;
  placeholder?: string;
};

export const Select = ({
  label,
  error,
  placeholder = "Select option...",
  shouldStick,
  children,
  ...props
}: SelectProps) => {
  const selectConfig = {
    placeholder,
    toggleTag: '<button type="button" aria-expanded="false"></button>',
    toggleClasses:
      "hs-error:border-red-400 hs-error:focus:ring-red-400 hs-success:border-gray-200 hs-success:focus:ring-blue-400 focus:ring-2 outline-none hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 border relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white rounded-lg text-start text-sm focus:outline-hidden",
    dropdownClasses: twMerge(
      "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300",
      shouldStick && "should-stick"
    ),
    optionClasses:
      "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100 hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50",
    optionTemplate:
      '<div class="flex justify-between items-center w-full"><span data-title></span><span class="hidden hs-selected:block"><svg class="shrink-0 size-3.5 text-blue-600" xmlns="http:.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></div>',
    extraMarkup:
      '<div class="absolute top-1/2 end-3 -translate-y-1/2"><svg class="shrink-0 size-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></div>',
  };
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <div className={error ? "error" : "success"}>
        <select
          data-hs-select={JSON.stringify(selectConfig)}
          className="hidden"
          {...props}
        >
          {children}
        </select>
      </div>
    </div>
  );
};
