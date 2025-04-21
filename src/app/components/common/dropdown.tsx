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

const DropdownButton = ({ children }: PropsWithChildren) => {
  return <button type="button">{children}</button>;
};

const DropdownGroup = ({ children }: PropsWithChildren) => {
  return (
    <div
      className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden z-10 duration-300 mt-2 min-w-60 bg-white shadow-md rounded-lg"
      role="menu"
    >
      <div className="p-1 space-y-0.5">{children}</div>
    </div>
  );
};

Dropdown.Button = DropdownButton;
Dropdown.Group = DropdownGroup;
