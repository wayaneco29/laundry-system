"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/common";
import { X, Users, Clock } from "lucide-react";
import { StaffView, StaffShiftFormData } from "@/app/types/database";
import {
  startStaffShift,
  getStaffByBranch,
  getActiveStaffShift,
} from "@/app/actions/staff/shift_actions";
import { toast } from "sonner";

interface StaffPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStaffId: string;
  currentStaffName: string;
  branches: { id: string; name: string }[];
  onShiftStarted: (shiftData: any) => void;
  refreshShiftStatus?: () => Promise<void>;
}

export function StaffPairingModal({
  isOpen,
  onClose,
  currentStaffId,
  currentStaffName,
  branches,
  onShiftStarted,
  refreshShiftStatus,
}: StaffPairingModalProps) {
  const [availableStaff, setAvailableStaff] = useState<StaffView[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isStartingShift, setIsStartingShift] = useState(false);

  // Auto-select branch if there's only one
  useEffect(() => {
    if (branches?.length === 1) {
      setSelectedBranchId(branches[0]?.id);
    }
  }, [branches]);

  useEffect(() => {
    if (isOpen && selectedBranchId) {
      loadAvailableStaff();
      checkExistingShift();
    }
  }, [isOpen, selectedBranchId]);

  const loadAvailableStaff = async () => {
    if (!selectedBranchId) return;

    try {
      setLoading(true);
      const staff = await getStaffByBranch(selectedBranchId);
      // Filter out current staff member
      const otherStaff = staff.filter((s) => s.user_id !== currentStaffId);

      setAvailableStaff(otherStaff);
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Failed to load available staff");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingShift = async () => {
    try {
      const activeShift = await getActiveStaffShift(currentStaffId);
      if (activeShift) {
        // Staff already has an active shift
        onShiftStarted(activeShift);
        onClose();
      }
    } catch (error) {
      // No active shift found, continue with modal
    }
  };

  const handleStartShift = async () => {
    if (!selectedBranchId) {
      toast.error("Please select a branch");
      return;
    }

    try {
      setIsStartingShift(true);

      // Start the shift in the database
      await startStaffShift({
        p_primary_staff_id: currentStaffId,
        p_branch_id: selectedBranchId,
        p_partner_staff_id: selectedPartnerId || undefined,
      });

      // Get the actual shift data from the database
      const actualShiftData = await getActiveStaffShift(currentStaffId);

      if (actualShiftData) {
        // Update the shift status with actual database data
        onShiftStarted(actualShiftData);

        const partnerName = selectedPartnerId
          ? availableStaff.find((s) => s.user_id === selectedPartnerId)
              ?.full_name
          : null;

        toast.success(
          selectedPartnerId
            ? `Shift started with ${partnerName}`
            : "Solo shift started successfully"
        );
      }

      onClose();
    } catch (error) {
      console.error("Error starting shift:", error);
      toast.error("Failed to start shift");
    } finally {
      setIsStartingShift(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Start Your Shift</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Welcome back, {currentStaffName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Date Info */}
          <div className="mt-4 flex items-center gap-2 text-blue-100 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {selectedBranchId &&
                branches?.find((branch) => branch?.id === selectedBranchId)
                  ?.name}
              {selectedBranchId && " • "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Select a partner to work with today, or work solo. Your sales and
              commission will be tracked for the day.
            </p>
          </div>

          {/* Branch Selection */}
          {branches?.length > 0 && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Select Branch
              </label>
              <div className="relative">
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setSelectedPartnerId(null);
                  }}
                  disabled={branches?.length === 1}
                  className={`w-full p-4 border-2 rounded-xl text-gray-900 bg-white shadow-sm transition-all ${
                    branches?.length === 1
                      ? "cursor-not-allowed opacity-75 bg-gray-50"
                      : "cursor-pointer hover:border-blue-300 hover:shadow-md"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  {!selectedBranchId && (
                    <option value="" disabled>
                      Choose a branch...
                    </option>
                  )}
                  {branches.map((branch) => (
                    <option key={branch?.id} value={branch?.id}>
                      {branch?.name}
                    </option>
                  ))}
                </select>
                {branches.length === 1 && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    Auto-selected (only assigned branch)
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedBranchId ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">
                Please select a branch to continue
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-sm text-blue-600 font-medium">
                Loading staff...
              </p>
            </div>
          ) : (
            <>
              {/* Partner Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Choose Your Co-Worker
                </label>
                <div className="relative">
                  <select
                    value={selectedPartnerId || "solo"}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedPartnerId(value === "solo" ? null : value);
                    }}
                    className="w-full p-4 border-2 rounded-xl text-gray-900 bg-white shadow-sm cursor-pointer hover:border-green-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  >
                    <option value="solo">🎯 Work Solo (No Partner)</option>
                    {availableStaff.map((staff) => (
                      <option key={staff.user_id} value={staff.user_id}>
                        👥 {staff.full_name} - {staff.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleStartShift}
                disabled={isStartingShift}
                loading={isStartingShift}
                fullWidth
                className="!py-4 !text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                leftIcon={
                  !isStartingShift ? <Users className="h-5 w-5" /> : undefined
                }
              >
                {isStartingShift
                  ? "Starting Shift..."
                  : selectedPartnerId
                  ? "Start Shift with Partner"
                  : "Start Solo Shift"}
              </Button>
            </>
          )}

          {/* Info Box */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">ℹ</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-semibold">Note:</span> Commission will
                  be calculated based on your sales for this shift. You can end
                  your shift anytime from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
