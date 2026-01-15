"use client";

import { PropsWithChildren, useState, useEffect, useRef } from "react";
import { useUserContext } from "@/app/context/UserContext";
import { StaffShiftContext } from "@/app/hooks/use-staff-shift";
import { StaffPairingModal } from "@/app/components/staff/staff-pairing-modal";
import { checkStaffShiftStatus } from "@/app/actions/staff/shift_actions";
import { ActiveStaffShift } from "@/app/types/database";
import { ROLE_STAFF } from "@/app/types";

export default function StaffShiftProvider({ children }: PropsWithChildren) {
  const user = useUserContext();
  const [activeShift, setActiveShift] = useState<ActiveStaffShift | null>(null);
  const [needsPairing, setNeedsPairing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPairingModal, setShowPairingModal] = useState(false);

  const isStaff = user?.role_name === ROLE_STAFF;
  const hasFetchedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get the selected branch ID from UserContext (set during login)
  const selectedBranchIdFromLogin = user?.selected_branch_id || null;

  const refreshShiftStatus = async () => {
    if (!isStaff || !user?.user_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const status = await checkStaffShiftStatus(user.user_id);

      setActiveShift(status.shiftData);
      setNeedsPairing(status.needsPairing);

      if (status.needsPairing) {
        setTimeout(() => setShowPairingModal(true), 1000);
      }
    } catch (error) {
      console.error("Error checking staff shift status:", error);
      setActiveShift(null);
      setNeedsPairing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onShiftStarted = (shiftData: ActiveStaffShift) => {
    console.log("onShiftStarted called with:", shiftData);
    setActiveShift(shiftData);
    setNeedsPairing(false);
    setShowPairingModal(false);
  };

  // Fetch shift status only once on mount
  useEffect(() => {
    if (!hasFetchedRef.current && isStaff && user?.user_id) {
      hasFetchedRef.current = true;
      refreshShiftStatus();
    }
  }, [isStaff, user?.user_id]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (!isStaff) return;

    intervalRef.current = setInterval(refreshShiftStatus, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStaff, user?.user_id]);

  // Compute the effective branch ID: prefer login selection, fall back to active shift
  const currentBranchId =
    selectedBranchIdFromLogin || activeShift?.branch_id || null;

  const contextValue = {
    activeShift,
    needsPairing: isStaff && needsPairing,
    isLoading,
    showPairingModal: isStaff && showPairingModal,
    setShowPairingModal,
    refreshShiftStatus,
    onShiftStarted,
    selectedBranchId: selectedBranchIdFromLogin,
    currentBranchId,
  };

  return (
    <StaffShiftContext.Provider value={contextValue}>
      {children}

      {/* Staff Pairing Modal - only show for staff members */}
      {isStaff && (
        <StaffPairingModal
          isOpen={showPairingModal}
          onClose={() => setShowPairingModal(false)}
          currentStaffId={user.user_id}
          currentStaffName={`${user.first_name} ${user.last_name}`}
          branches={user.branches || []}
          onShiftStarted={onShiftStarted}
          refreshShiftStatus={refreshShiftStatus}
          selectedBranchIdFromLogin={selectedBranchIdFromLogin}
        />
      )}
    </StaffShiftContext.Provider>
  );
}
