'use client';

import { useState, useEffect } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import { getActiveStaffShift, checkStaffShiftStatus } from '@/app/actions/staff/shift_actions';
import { ActiveStaffShift } from '@/app/types/database';

interface StaffShiftHook {
  activeShift: ActiveStaffShift | null;
  needsPairing: boolean;
  isLoading: boolean;
  showPairingModal: boolean;
  setShowPairingModal: (show: boolean) => void;
  refreshShiftStatus: () => Promise<void>;
  onShiftStarted: (shiftData: ActiveStaffShift) => void;
}

export function useStaffShift(): StaffShiftHook {
  const user = useUserContext();
  const [activeShift, setActiveShift] = useState<ActiveStaffShift | null>(null);
  const [needsPairing, setNeedsPairing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPairingModal, setShowPairingModal] = useState(false);

  const isStaff = user?.role_name !== 'Admin'; // Assuming non-admin users are staff

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
      
      // Show pairing modal if staff needs to pair and modal isn't already shown
      if (status.needsPairing && !showPairingModal) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          setShowPairingModal(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking staff shift status:', error);
      setNeedsPairing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onShiftStarted = (shiftData: ActiveStaffShift) => {
    setActiveShift(shiftData);
    setNeedsPairing(false);
    setShowPairingModal(false);
  };

  useEffect(() => {
    refreshShiftStatus();
  }, [user?.user_id, isStaff]);

  // Auto-refresh shift status every 5 minutes
  useEffect(() => {
    if (!isStaff) return;

    const interval = setInterval(refreshShiftStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isStaff]);

  return {
    activeShift,
    needsPairing: isStaff && needsPairing,
    isLoading,
    showPairingModal: isStaff && showPairingModal,
    setShowPairingModal,
    refreshShiftStatus,
    onShiftStarted,
  };
}