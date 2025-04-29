"use client";

import { createContext, PropsWithChildren, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  TagIcon,
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  DocumentChartBarIcon,
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  ArchiveBoxIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";

type SidebarContextType = Record<string, never>;

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const ROUTES = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: HomeIcon,
  },
  {
    path: "/orders",
    label: "Orders",
    icon: ShoppingBagIcon,
  },
  {
    path: "/customers",
    label: "Customers",
    icon: UserGroupIcon,
  },
  {
    path: "/staffs",
    label: "Staffs",
    icon: UsersIcon,
  },
  {
    path: "/branches",
    label: "Branches",
    icon: BuildingOffice2Icon,
  },
  {
    path: "/promos",
    label: "Promos",
    icon: TagIcon,
  },
  {
    path: "/inventory",
    label: "Inventory",
    icon: ArchiveBoxIcon,
  },
  {
    path: "/reports",
    label: "Reports",
    icon: DocumentChartBarIcon,
  },
  {
    path: "/logout",
    label: "Logout",
    icon: ArrowLeftStartOnRectangleIcon,
  },
];

export const SidebarContextProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState<boolean>(false);
  const [minimize, setMinimized] = useState<boolean>(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{}}>
      <div
        className={twMerge(
          "hs-overlay [--auto-close:lg] z-50 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full fixed top-0 start-0 bottom-0 bg-white border-e border-gray-200",
          minimize ? "w-80 lg:w-15" : "w-80",
          open
            ? "open opened "
            : "pointer-events-none -translate-x-ful lg:pointer-events-auto"
        )}
        role="dialog"
        tabIndex={-1}
        aria-label="Sidebar"
      >
        <div className="relative flex flex-col h-full max-h-full ">
          <div className="h-20 shadow-sm flex justify-center items-center">
            {minimize ? (
              <span className="text-gray-700 text-sm">LOGO</span>
            ) : (
              <span className="text-gray-700 text-2xl">120 x 120</span>
            )}
          </div>
          <div className="p-2">
            <ul className="flex flex-col gap-2 mt-4">
              {ROUTES?.map(({ path, label, icon: Icon }, index) => (
                <Link
                  key={index}
                  href={path}
                  className={twMerge(
                    "p-3 rounded-md font-medium text-gray-700 flex items-center gap-2 cursor-pointer",
                    isActive(path) && "bg-blue-400 text-white"
                  )}
                >
                  <Icon height={20} />
                  <span
                    className={twMerge(
                      minimize ? "inline-block lg:hidden" : "inline-block"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <main
        className={twMerge(
          "bg-gray-50 min-h-screen pb-4 z-10 flex flex-col transition-all duration-300 ",
          minimize ? "lg:ml-15" : "lg:ml-80"
        )}
      >
        <nav className="h-20 bg-white min-h-20 max-h-20 sticky shadow-sm top-0 left-0 right-0">
          <div className="flex justify-between px-4 h-full items-center ">
            <div className="text-gray-700 flex items-center justify-center ">
              <button
                type="button"
                className="cursor-pointer"
                aaria-haspopup="dialog"
                aria-expanded="false"
                aria-controls="custom-sidebar"
                aria-label="Toggle navigation"
                data-hs-overlay="#custom-sidebar"
                onClick={() => {
                  if (window.innerWidth > 1024) {
                    setMinimized((prev) => !prev);
                  } else {
                    setOpen((prev) => !prev);
                  }
                }}
              >
                <Bars3Icon height={24} />
              </button>
            </div>
            <div className="flex items-end">
              <div className="h-15 w-15 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="font-bold text-sm">10x10</span>
              </div>
            </div>
          </div>
        </nav>
        <section className="w-full h-full">{children}</section>
        <footer></footer>
      </main>
      {/* End Sidebar */}
      {open && (
        <div
          id="custom-sidebar-backdrop"
          className="hs-overlay-backdrop transition duration-75 fixed"
          onClick={() => setOpen(false)}
        />
      )}
    </SidebarContext.Provider>
  );
};
