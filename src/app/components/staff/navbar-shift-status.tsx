'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, UserCheck, UserX } from 'lucide-react';
import { useStaffShift } from '@/app/hooks/use-staff-shift';
import { PartnerManagementModal } from './partner-management-modal';

export function NavbarShiftStatus() {
  const { activeShift, isLoading } = useStaffShift();
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fix hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't render anything until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  if (isLoading) {
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
        onClick={() => setShowPartnerModal(true)}
        className="flex items-center gap-2 px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors duration-200 text-amber-700 text-xs font-medium"
      >
        <UserX className="w-4 h-4" />
        <span className="hidden sm:inline">No Active Shift</span>
        <span className="sm:hidden">No Shift</span>
      </button>
    );
  }

  const hasPartner = activeShift.partner_staff_id && activeShift.partner_name;

  return (
    <>
      <button
        onClick={() => setShowPartnerModal(true)}
        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-200 text-xs font-medium ${
          hasPartner
            ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
            : 'bg-green-100 hover:bg-green-200 text-green-700'
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

      {/* Partner Management Modal - Only render when needed */}
      {showPartnerModal && (
        <PartnerManagementModal
          isOpen={showPartnerModal}
          onClose={() => setShowPartnerModal(false)}
          currentShift={activeShift}
          onPartnerUpdated={() => {
            // The useStaffShift hook will handle refreshing
          }}
        />
      )}
    </>
  );
}