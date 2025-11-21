"use client";

import { createContext, useContext } from "react";
import { ActiveStaffShift } from "@/app/types/database";

interface StaffShiftContextType {
  activeShift: ActiveStaffShift | null;
  needsPairing: boolean;
  isLoading: boolean;
  showPairingModal: boolean;
  setShowPairingModal: (show: boolean) => void;
  refreshShiftStatus: () => Promise<void>;
  onShiftStarted: (shiftData: ActiveStaffShift) => void;
}

const StaffShiftContext = createContext<StaffShiftContextType | undefined>(
  undefined
);

export function useStaffShift(): StaffShiftContextType {
  const context = useContext(StaffShiftContext);
  if (!context) {
    throw new Error("useStaffShift must be used within a StaffShiftProvider");
  }
  return context;
}

export { StaffShiftContext };
