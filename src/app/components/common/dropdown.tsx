"use client";

import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export const Dropdown = ({
  children,
  className = "",
}: PropsWithChildren & { className?: string }) => {
  return (
    <div className={twMerge("hs-dropdown relative inline-flex", className)}>
      {children}
    </div>
  );
};

const DropdownButton = ({
  children,
  className = "",
}: PropsWithChildren & { className?: string }) => {
  return (
    <button className={className} type="button">
      {children}
    </button>
  );
};

const DropdownGroup = ({
  children,
  containerClassName = "",
}: PropsWithChildren & { containerClassName?: string }) => {
  return (
    <div
      className={twMerge(
        "hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden z-10 duration-300 mt-2 min-w-60 bg-white shadow-md rounded-lg",
        containerClassName
      )}
    >
      <div className="p-1 space-y-0.5">{children}</div>
    </div>
  );
};

Dropdown.Button = DropdownButton;
Dropdown.Group = DropdownGroup;
