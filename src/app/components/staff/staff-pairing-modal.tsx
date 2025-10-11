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
  branchId: string;
  branchName: string;
  onShiftStarted: (shiftData: any) => void;
}

export default function StaffPairingModal({
  isOpen,
  onClose,
  currentStaffId,
  currentStaffName,
  branchId,
  branchName,
  onShiftStarted,
}: StaffPairingModalProps) {
  const [availableStaff, setAvailableStaff] = useState<StaffView[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isStartingShift, setIsStartingShift] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableStaff();
      checkExistingShift();
    }
  }, [isOpen, branchId]);

  const loadAvailableStaff = async () => {
    try {
      setLoading(true);
      const staff = await getStaffByBranch(branchId);
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
    try {
      setIsStartingShift(true);

      console.log({
        p_primary_staff_id: currentStaffId,
        p_branch_id: branchId,
        p_partner_staff_id: selectedPartnerId || undefined,
      });
      const shiftData = await startStaffShift({
        p_primary_staff_id: currentStaffId,
        p_branch_id: branchId,
        p_partner_staff_id: selectedPartnerId || undefined,
      });

      const partnerName = selectedPartnerId
        ? availableStaff.find((s) => s.user_id === selectedPartnerId)?.full_name
        : null;

      toast.success(
        selectedPartnerId
          ? `Shift started with ${partnerName}`
          : "Solo shift started successfully"
      );

      onShiftStarted({
        shift_id: shiftData.shift_id,
        partner_staff_id: selectedPartnerId,
        partner_name: partnerName,
        branch_id: branchId,
        branch_name: branchName,
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

  const handleWorkSolo = () => {
    setSelectedPartnerId(null);
    handleStartShift();
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
                {branchName} •{" "}
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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Partner Selection */}
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-gray-900">
                  Choose Your Partner
                </h3>

                {availableStaff.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No other staff available at this branch</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {availableStaff.map((staff) => (
                      <button
                        key={staff.user_id}
                        onClick={() => setSelectedPartnerId(staff.user_id)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          selectedPartnerId === staff.user_id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {staff.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {staff.phone}
                            </p>
                          </div>
                          {selectedPartnerId === staff.user_id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {selectedPartnerId && (
                  <Button
                    onClick={handleStartShift}
                    disabled={isStartingShift}
                    loading={isStartingShift}
                    fullWidth
                    leftIcon={
                      !isStartingShift ? (
                        <Users className="h-4 w-4" />
                      ) : undefined
                    }
                  >
                    {isStartingShift
                      ? "Starting Shift..."
                      : "Start Shift with Partner"}
                  </Button>
                )}

                <Button
                  onClick={handleWorkSolo}
                  disabled={isStartingShift}
                  loading={isStartingShift}
                  variant={selectedPartnerId ? "outline" : "primary"}
                  fullWidth
                >
                  {isStartingShift ? "Starting Shift..." : "Work Solo Today"}
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
