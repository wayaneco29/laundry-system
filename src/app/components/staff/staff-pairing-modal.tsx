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
}

export function StaffPairingModal({
  isOpen,
  onClose,
  currentStaffId,
  currentStaffName,
  branches,
  onShiftStarted,
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

      const shiftData = await startStaffShift({
        p_primary_staff_id: currentStaffId,
        p_branch_id: selectedBranchId,
        p_partner_staff_id: selectedPartnerId || undefined,
      });

      const partnerName = selectedPartnerId
        ? availableStaff.find((s) => s.user_id === selectedPartnerId)?.full_name
        : null;

      const selectedBranchName = branches?.find(
        (branch) => branch?.id === selectedBranchId
      )?.name;

      toast.success(
        selectedPartnerId
          ? `Shift started with ${partnerName}`
          : "Solo shift started successfully"
      );
      console.log({
        shift_id: shiftData.shift_id,
        partner_staff_id: selectedPartnerId,
        partner_name: partnerName,
        branch_id: selectedBranchId,
        branch_name: selectedBranchName,
        start_time: new Date().toISOString(),
      });
      onShiftStarted({
        shift_id: shiftData.shift_id,
        partner_staff_id: selectedPartnerId,
        partner_name: partnerName,
        branch_id: selectedBranchId,
        branch_name: selectedBranchName,
        start_time: new Date().toISOString(),
      });

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Start Your Shift
              </h2>
              <p className="text-sm text-gray-500">
                Welcome back, {currentStaffName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            leftIcon={<X className="h-4 w-4" />}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {selectedBranchId &&
                  branches?.find((branch) => branch?.id === selectedBranchId)
                    ?.name}{" "}
                •{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Select a partner to work with today, or work solo. Your sales and
              commission will be tracked for the day.
            </p>
          </div>

          {/* Branch Selection */}
          {branches?.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="font-medium text-gray-900">Select Branch</h3>
              <div className="relative">
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setSelectedPartnerId(null); // Reset partner selection when branch changes
                  }}
                  disabled={branches?.length === 1}
                  className={`w-full p-3 border rounded-lg text-gray-900 bg-white ${
                    branches?.length === 1
                      ? "cursor-not-allowed opacity-75 bg-gray-50"
                      : "cursor-pointer hover:border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                  <div className="mt-1 text-xs text-gray-500">
                    Auto-selected (only assigned branch)
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedBranchId ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Please select a branch to continue</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Partner Selection */}
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-gray-900">
                  Choose Your Co-Worker
                </h3>
                <div className="relative">
                  <select
                    value={selectedPartnerId || "solo"}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedPartnerId(value === "solo" ? null : value);
                    }}
                    className="w-full p-3 border rounded-lg text-gray-900 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="solo">Work Solo (No Partner)</option>
                    {availableStaff.map((staff) => (
                      <option key={staff.user_id} value={staff.user_id}>
                        {staff.full_name} - {staff.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleStartShift}
                  disabled={isStartingShift}
                  loading={isStartingShift}
                  fullWidth
                  leftIcon={
                    !isStartingShift ? <Users className="h-4 w-4" /> : undefined
                  }
                >
                  {isStartingShift
                    ? "Starting Shift..."
                    : selectedPartnerId
                    ? "Start Shift with Partner"
                    : "Start Solo Shift"}
                </Button>
              </div>
            </>
          )}

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Commission will be calculated based on your
              sales for this shift. You can end your shift anytime from the
              dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
