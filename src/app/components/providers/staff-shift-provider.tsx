"use client";

import { PropsWithChildren } from "react";
import { useUserContext } from "@/app/context/UserContext";
import { useStaffShift } from "@/app/hooks/use-staff-shift";
import { StaffPairingModal } from "@/app/components/staff/staff-pairing-modal";
import { ROLE_ADMIN } from "@/app/types";

export default function StaffShiftProvider({ children }: PropsWithChildren) {
  const user = useUserContext();
  const { activeShift, showPairingModal, setShowPairingModal, onShiftStarted } =
    useStaffShift();

  const isStaff = user?.role_name !== ROLE_ADMIN;

  return (
    <>
      {children}

      {/* Staff Pairing Modal - only show for staff members */}
      {isStaff && (
        <StaffPairingModal
          isOpen={showPairingModal}
          onClose={() => setShowPairingModal(false)}
          currentStaffId={user.user_id}
          currentStaffName={`${user.first_name} ${user.last_name}`}
          branchIds={user.branch_ids || []}
          branchNames={user.branch_names || []}
          onShiftStarted={onShiftStarted}
        />
      )}
    </>
  );
}
