"use client";

import { PropsWithChildren } from "react";
import { useUserContext } from "@/app/context/UserContext";
import { useStaffShift } from "@/app/hooks/use-staff-shift";
import { StaffPairingModal } from "@/app/components/staff/staff-pairing-modal";
import { ROLE_ADMIN } from "@/app/types";

export default function StaffShiftProvider({ children }: PropsWithChildren) {
  const { role_name, user_id, first_name, last_name, branches } =
    useUserContext();
  const { activeShift, showPairingModal, setShowPairingModal, onShiftStarted } =
    useStaffShift();

  const isStaff = role_name !== ROLE_ADMIN;

  return (
    <>
      {children}

      {/* Staff Pairing Modal - only show for staff members */}
      {isStaff && (
        <StaffPairingModal
          isOpen={showPairingModal}
          onClose={() => setShowPairingModal(false)}
          currentStaffId={user_id}
          currentStaffName={`${first_name} ${last_name}`}
          branches={branches || []}
          onShiftStarted={onShiftStarted}
        />
      )}
    </>
  );
}
