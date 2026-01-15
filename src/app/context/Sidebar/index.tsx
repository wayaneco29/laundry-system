"use client";

import {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Home,
  ShoppingBag,
  Users,
  UserCheck,
  Building2,
  Tag,
  Package,
  Archive,
  FileBarChart,
  Receipt,
  LogOut,
  Menu,
  X,
  KeyIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { LogoutButton } from "@/app/components/auth/logout-button";
import { ChangeOwnPasswordModal } from "@/app/components/auth/change-own-password-modal";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF } from "@/app/types";
import { useUserContext } from "../UserContext";
import { SimpleShiftStatus } from "@/app/components/staff/simple-shift-status";
import { PrinterStatusIndicator } from "@/app/components/printer/printer-status-indicator";

type SidebarContextType = Record<string, never>;

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const ROUTES = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: Home,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER],
  },
  {
    path: "/orders",
    label: "Orders",
    icon: ShoppingBag,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  },
  {
    path: "/customers",
    label: "Customers",
    icon: Users,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  },
  {
    path: "/staffs",
    label: "Staffs",
    icon: UserCheck,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER],
  },
  {
    path: "/branches",
    label: "Branches",
    icon: Building2,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER],
  },
  {
    path: "/services",
    label: "Services",
    icon: Package,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER],
  },
  {
    path: "/expenses",
    label: "Expenses",
    icon: Receipt,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  },
  {
    path: "/promos",
    label: "Promos",
    icon: Tag,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER],
  },
  {
    path: "/inventory",
    label: "Inventory",
    icon: Archive,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  },
  {
    path: "/reports",
    label: "Reports",
    icon: FileBarChart,
    allowedRole: [ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF],
  },
];

export const SidebarContextProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState<boolean>(false);
  const [minimize, setMinimized] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const pathname = usePathname();
  const { user, loading: userLoading } = useCurrentUser();
  const { role_name } = useUserContext();

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{}}>
      {/* Sidebar */}
      <div
        className={twMerge(
          "hs-overlay [--auto-close:lg] z-50 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full fixed top-0 start-0 bottom-0 bg-gradient-to-b from-slate-900 to-slate-800 border-e border-slate-700 shadow-2xl",
          minimize ? "w-80 lg:w-20" : "w-80",
          open
            ? "open opened "
            : "pointer-events-none -translate-x-full lg:pointer-events-auto lg:translate-x-0"
        )}
        role="dialog"
        tabIndex={-1}
        aria-label="Sidebar"
      >
        <div className="relative flex flex-col h-full max-h-full">
          {/* Logo Section */}
          <div className="h-20 flex justify-center items-center border-b border-slate-700 bg-slate-900/50">
            {minimize ? (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.svg"
                  alt="Laundry Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="px-4">
                <Image
                  src="/logo-horizontal.svg"
                  alt="Laundry Logo"
                  width={180}
                  height={50}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
            <div className="space-y-2">
              {ROUTES?.map(
                ({ path, label, icon: Icon, allowedRole }, index) => {
                  const isActiveRoute = isActive(path);

                  if (!allowedRole?.includes(role_name)) return null;

                  return (
                    <Link
                      key={index}
                      href={path}
                      className={twMerge(
                        "group relative flex items-center rounded-xl font-medium transition-all duration-200 hover:bg-slate-700/50",
                        isActiveRoute
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-300 hover:text-white",
                        minimize
                          ? "lg:justify-center lg:px-3 lg:py-3"
                          : "gap-3 px-3 py-3"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span
                        className={twMerge(
                          "transition-all duration-200 whitespace-nowrap",
                          minimize ? "lg:hidden" : "opacity-100"
                        )}
                      >
                        {label}
                      </span>

                      {/* Tooltip for minimized state */}
                      {minimize && (
                        <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                          {label}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700"></div>
                        </div>
                      )}
                    </Link>
                  );
                }
              )}

              {/* Logout Button */}
            </div>
          </div>

          {/* Collapse Button */}
          <div className="p-4 border-t border-slate-700">
            <LogoutButton
              className={twMerge(
                "group relative flex items-center rounded-xl font-medium transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:text-white",
                minimize
                  ? "lg:justify-center lg:px-3 lg:py-3"
                  : "gap-3 px-3 py-3"
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span
                className={twMerge(
                  "transition-all duration-200 whitespace-nowrap",
                  minimize ? "lg:hidden" : "opacity-100"
                )}
              >
                Logout
              </span>

              {/* Tooltip for minimized state */}
              {minimize && (
                <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                  Logout
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700"></div>
                </div>
              )}
            </LogoutButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={twMerge(
          "bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen pb-4 z-10 flex flex-col transition-all duration-300",
          minimize ? "lg:ml-20" : "lg:ml-80"
        )}
      >
        {/* Navbar */}
        <nav className="h-20 bg-white/80 backdrop-blur-sm min-h-20 max-h-20 sticky shadow-sm top-0 left-0 right-0 border-b border-slate-200/50 z-40">
          <div className="flex justify-between px-4 h-full items-center">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                onClick={() => setOpen(!open)}
              >
                {open ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              <button
                type="button"
                className="hidden lg:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                onClick={() => setMinimized(!minimize)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Co-worker Status and User Profile */}
            <div className="flex items-center gap-3">
              {/* Co-worker Status Indicator for Staff */}
              {role_name === ROLE_STAFF && <SimpleShiftStatus />}

              {/* Printer Status Indicator */}
              <PrinterStatusIndicator />

              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-1 transition-colors duration-200"
                >
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {userLoading
                        ? "Loading..."
                        : user?.user_metadata?.full_name ||
                          user?.email ||
                          "User"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {role_name === ROLE_ADMIN ? "Administrator" : "Staff"}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-sm">
                      {userLoading
                        ? "--"
                        : user?.user_metadata?.full_name
                        ? user.user_metadata.full_name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                        : user?.email?.slice(0, 2)?.toUpperCase() || "U"}
                    </span>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowPasswordModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors duration-200"
                      >
                        <KeyIcon className="w-4 h-4" />
                        Change Password
                      </button>
                      <div className="border-t border-slate-200 my-1" />
                      <LogoutButton className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </LogoutButton>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <section className="w-full h-full flex-1">{children}</section>
      </main>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Change Password Modal */}
      <ChangeOwnPasswordModal
        showModal={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);

  if (context === undefined) {
    throw new Error(
      "useSidebarContext must be used within a SidebarContextProvider"
    );
  }

  return context;
};
