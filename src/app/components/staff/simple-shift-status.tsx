"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Users, UserCheck, UserX, X, MapPin } from "lucide-react";
import { useStaffShift } from "@/app/hooks/use-staff-shift";

export function SimpleShiftStatus() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { activeShift, isLoading: shiftLoading } = useStaffShift();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (shiftLoading) {
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
        onClick={() => setShowModal(true)}
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
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-200 text-xs font-medium ${
          hasPartner
            ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
            : "bg-green-100 hover:bg-green-200 text-green-700"
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

      {/* Simple Shift Info Modal */}
      {showModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Shift Information
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Branch */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Branch</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {activeShift.branch_name}
                    </p>
                  </div>
                </div>

                {/* Coworker */}
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    hasPartner ? "bg-green-50" : "bg-gray-50"
                  }`}
                >
                  {hasPartner ? (
                    <Users className="w-5 h-5 text-green-600" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Coworker</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {hasPartner ? activeShift.partner_name : "Working Solo"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
