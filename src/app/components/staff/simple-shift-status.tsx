"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  UserCheck,
  UserX,
  X,
  UserPlus,
  UserMinus,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useUserContext } from "@/app/context/UserContext";
import { useStaffShift } from "@/app/hooks/use-staff-shift";
import {
  getStaffByBranch,
  updateShiftPartner,
  removeShiftPartner,
  addShiftPartner,
} from "@/app/actions/staff/shift_actions";
import type { StaffView } from "@/app/types/database";

export function SimpleShiftStatus() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<StaffView[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffView[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const user = useUserContext();
  const {
    activeShift,
    isLoading: shiftLoading,
    refreshShiftStatus,
  } = useStaffShift();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load available staff when modal opens
  useEffect(() => {
    if (showModal && activeShift?.branch_id) {
      loadAvailableStaff();
    }
  }, [showModal, activeShift?.branch_id]);

  // Filter staff based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStaff(availableStaff);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStaff(
        availableStaff.filter(
          (staff) =>
            staff.full_name?.toLowerCase().includes(query) ||
            staff.first_name?.toLowerCase().includes(query) ||
            staff.last_name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, availableStaff]);

  if (!mounted) {
    return null; // Don't render anything until mounted
  }

  const loadAvailableStaff = async () => {
    if (!activeShift?.branch_id) return;

    setIsLoading(true);
    try {
      const staff = await getStaffByBranch(activeShift.branch_id);

      const eligibleStaff = staff.filter((s) => s.user_id !== user?.user_id);
      setAvailableStaff(eligibleStaff);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPartner = async (partnerId: string) => {
    if (!activeShift?.shift_id) return;

    setIsUpdating(true);
    try {
      await addShiftPartner(activeShift.shift_id, partnerId);
      await refreshShiftStatus();
      setShowModal(false);
    } catch (error) {
      console.error("Error adding partner:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemovePartner = async () => {
    if (!activeShift?.shift_id) return;

    setIsUpdating(true);
    try {
      await removeShiftPartner(activeShift.shift_id);
      await refreshShiftStatus();
      setShowModal(false);
    } catch (error) {
      console.error("Error removing partner:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClick = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    if (!isUpdating) {
      setSearchQuery("");
      setShowModal(false);
    }
  };

  if (shiftLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!activeShift) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors duration-200 text-amber-700 text-xs font-medium"
      >
        <UserX className="w-4 h-4" />
        <span className="hidden sm:inline">No Active Shift</span>
        <span className="sm:hidden">No Shift</span>
      </button>
    );
  }

  console.log(activeShift);

  const hasPartner = activeShift.partner_staff_id && activeShift.partner_name;
  const currentPartner = activeShift?.partner_staff_id;
  console.log({ hasPartner, currentPartner });
  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-200 text-xs font-medium ${
          hasPartner
            ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
            : "bg-green-100 hover:bg-green-200 text-green-700"
        }`}
      >
        {hasPartner ? (
          <>
            <Users className="w-4 h-4" />
            <span className="hidden lg:inline">
              With: {activeShift.partner_name}
            </span>
            <span className="hidden sm:inline lg:hidden">
              {activeShift.partner_name}
            </span>
            <span className="sm:hidden">Partner</span>
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Working Solo</span>
            <span className="sm:hidden">Solo</span>
          </>
        )}
      </button>

      {/* Co-worker Management Modal */}
      {showModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Manage Co-worker
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add, remove, or change your shift partner
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isUpdating}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Current Status */}
                <div
                  className={`rounded-xl p-5 border-2 transition-all duration-200 ${
                    hasPartner
                      ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                      : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                  }`}
                >
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        hasPartner ? "bg-blue-500" : "bg-gray-400"
                      }`}
                    ></div>
                    Current Status
                  </h4>

                  {hasPartner ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-base font-semibold text-gray-900">
                            Working with: {activeShift.partner_name}
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            ✨ Collaborative shift active
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePartner}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                        Remove Partner
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        <div className="text-base font-semibold text-gray-900">
                          Working Solo
                        </div>
                        <div className="text-sm text-gray-500">
                          🎯 Independent shift mode
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add/Change Partner Section */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      {hasPartner ? "Change Co-worker" : "Add Co-worker"}
                    </h4>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      📍 {activeShift?.branch_name}
                    </span>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search staff members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isLoading || isUpdating}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 disabled:opacity-50 disabled:bg-gray-50 transition-all duration-200 text-sm font-medium"
                    />
                  </div>

                  {/* Staff List */}
                  <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl bg-gray-50/50">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-b from-blue-50 to-indigo-50">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                        <span className="text-sm font-medium text-blue-600">
                          Loading staff members...
                        </span>
                      </div>
                    ) : filteredStaff.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-b from-gray-50 to-slate-50">
                        <AlertCircle className="h-8 w-8 text-gray-400 mb-3" />
                        <span className="text-sm font-medium text-gray-600">
                          {searchQuery
                            ? "🔍 No staff members found"
                            : "👥 No available staff members"}
                        </span>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredStaff.map((staff) => {
                          const isCurrentPartner =
                            staff.user_id === currentPartner;

                          return (
                            <div
                              key={staff.id}
                              className={`flex items-center justify-between p-4 transition-all duration-200 hover:shadow-sm ${
                                isCurrentPartner
                                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400"
                                  : "hover:bg-white hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                                      isCurrentPartner
                                        ? "bg-blue-100 text-blue-600 ring-2 ring-blue-200"
                                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                                    }`}
                                  >
                                    {staff.first_name?.[0] || "?"}
                                    {staff.last_name?.[0] || "?"}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`text-sm font-semibold ${
                                      isCurrentPartner
                                        ? "text-blue-900"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {staff.full_name ||
                                      `${staff.first_name} ${staff.last_name}`}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      isCurrentPartner
                                        ? "text-blue-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    ID: {staff.id?.slice(-8) || "N/A"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {isCurrentPartner ? (
                                  <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-full">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-bold text-blue-700">
                                      Current Partner
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleAddPartner(staff?.user_id!)
                                    }
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white  bg-blue-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserPlus className="h-4 w-4" />
                                    )}
                                    {hasPartner ? "Switch" : "Select"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100">
                  <div className="text-xs text-gray-500">
                    💡 Changes take effect immediately
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isUpdating}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
