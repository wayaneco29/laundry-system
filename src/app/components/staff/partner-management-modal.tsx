"use client";

import { useState, useEffect } from "react";
import {
  X,
  Users,
  UserPlus,
  UserMinus,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button, Modal } from "@/app/components/common";
import { useUserContext } from "@/app/context/UserContext";
import {
  getStaffByBranch,
  updateShiftPartner,
  removeShiftPartner,
  addShiftPartner,
} from "@/app/actions/staff/shift_actions";
import { useToast } from "@/app/hooks";
import type { ActiveStaffShift, StaffView } from "@/app/types/database";

interface PartnerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShift: ActiveStaffShift | null;
  onPartnerUpdated: () => void;
}

export function PartnerManagementModal({
  isOpen,
  onClose,
  currentShift,
  onPartnerUpdated,
}: PartnerManagementModalProps) {
  const user = useUserContext();
  const toast = useToast();
  const [availableStaff, setAvailableStaff] = useState<StaffView[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffView[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load available staff when modal opens
  useEffect(() => {
    if (isOpen && currentShift?.branch_id) {
      loadAvailableStaff();
    }
  }, [isOpen, currentShift?.branch_id]);
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

  const loadAvailableStaff = async () => {
    if (!currentShift?.branch_id) return;

    setIsLoading(true);
    try {
      const staff = await getStaffByBranch(currentShift.branch_id);
      // Filter out the current user from available partners
      const eligibleStaff = staff.filter((s) => s.user_id !== user?.user_id);
      setAvailableStaff(eligibleStaff);
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Failed to load available staff members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPartner = async (partnerId: string) => {
    if (!currentShift?.shift_id) return;

    setIsUpdating(true);
    try {
      await addShiftPartner(currentShift.shift_id, partnerId);
      toast.success("Co-worker added successfully");
      onPartnerUpdated();
      onClose();
    } catch (error) {
      console.error("Error adding partner:", error);
      toast.error("Failed to add co-worker");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemovePartner = async () => {
    if (!currentShift?.shift_id) return;

    setIsUpdating(true);
    try {
      await removeShiftPartner(currentShift.shift_id);
      toast.success("Co-worker removed successfully");
      onPartnerUpdated();
      onClose();
    } catch (error) {
      console.error("Error removing partner:", error);
      toast.error("Failed to remove co-worker");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setSearchQuery("");
      onClose();
    }
  };

  const currentPartner = currentShift?.partner_staff_id;
  const hasPartner = !!currentPartner;

  return (
    <Modal show={isOpen} onClose={handleClose} title="Manage Co-worker">
      <div className="space-y-6">
        {/* Current Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Current Status
          </h3>

          {hasPartner ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Working with: {currentShift.partner_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Collaborative shift active
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemovePartner}
                disabled={isUpdating}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserMinus className="h-4 w-4" />
                )}
                <span className="ml-1">Remove</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Working Solo
                </div>
                <div className="text-xs text-gray-500">
                  No co-worker currently assigned
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add/Change Partner Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {hasPartner ? "Change Co-worker" : "Add Co-worker"}
            </h3>
            <span className="text-xs text-gray-500">
              Branch: {currentShift?.branch_name}
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading || isUpdating}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Staff List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  Loading staff members...
                </span>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <AlertCircle className="h-6 w-6 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  {searchQuery
                    ? "No staff members found"
                    : "No available staff members"}
                </span>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredStaff.map((staff) => {
                  const isCurrentPartner = staff.user_id === currentPartner;

                  return (
                    <div
                      key={staff.id}
                      className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${
                        isCurrentPartner ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {staff.first_name?.[0]}
                              {staff.last_name?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {staff.full_name ||
                              `${staff.first_name} ${staff.last_name}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            Staff ID: {staff.id.slice(-8)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isCurrentPartner ? (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Current</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddPartner(staff.user_id!)}
                            disabled={isUpdating}
                            className="text-xs"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserPlus className="h-3 w-3" />
                            )}
                            <span className="ml-1">
                              {hasPartner ? "Switch" : "Add"}
                            </span>
                          </Button>
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
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={handleClose} disabled={isUpdating}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
