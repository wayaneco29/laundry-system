'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Edit3, 
  UserPlus, 
  UserMinus,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useUserContext } from '@/app/context/UserContext';
import { useStaffShift } from '@/app/hooks/use-staff-shift';
import { Button } from '@/app/components/common';
import { PartnerManagementModal } from './partner-management-modal';

interface ShiftStatusCardProps {
  className?: string;
}

export function ShiftStatusCard({ className = '' }: ShiftStatusCardProps) {
  const user = useUserContext();
  const { activeShift, isLoading, refreshShiftStatus } = useStaffShift();
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [shiftDuration, setShiftDuration] = useState<string>('');

  const isStaff = user?.role_name !== 'Admin';

  // Update shift duration every minute
  useEffect(() => {
    if (!activeShift?.start_time) return;

    const updateDuration = () => {
      const start = new Date(activeShift.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setShiftDuration(`${hours}h ${minutes}m`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeShift?.start_time]);

  // Don't show for admin users
  if (!isStaff || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeShift) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                No Active Shift
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                Please start your shift to begin working
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            Start Shift
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Active Shift
            </h3>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{shiftDuration}</span>
          </div>
        </div>

        {/* Shift Info */}
        <div className="p-4 space-y-4">
          {/* Shift Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Started:</span>
              <div className="font-medium text-gray-900">
                {formatTime(activeShift.start_time)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Branch:</span>
              <div className="font-medium text-gray-900">
                {activeShift.branch_name}
              </div>
            </div>
          </div>

          {/* Co-worker Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Co-worker Status
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPartnerModal(true)}
                className="text-blue-600 hover:text-blue-700 p-1"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>

            {activeShift.partner_staff_id && activeShift.partner_name ? (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-blue-900">
                    Working with: {activeShift.partner_name}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Team collaboration active
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPartnerModal(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700">
                    Working Solo
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    No co-worker assigned
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPartnerModal(true)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPartnerModal(true)}
                className="flex-1 text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Manage Partner
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshShiftStatus}
                className="text-xs px-3"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Management Modal */}
      <PartnerManagementModal
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
        currentShift={activeShift}
        onPartnerUpdated={refreshShiftStatus}
      />
    </>
  );
}