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

      {/* Beautiful Shift Info Modal */}
      {showModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden">
              {/* Header with Gradient */}
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Shift Information</h3>
                      <p className="text-indigo-100 text-sm mt-0.5">
                        Current shift details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Branch Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Branch Location
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        {activeShift.branch_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coworker Card */}
                <div
                  className={`relative overflow-hidden rounded-xl p-4 border-2 shadow-sm ${
                    hasPartner
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 ${
                      hasPartner ? "bg-green-200/30" : "bg-gray-200/30"
                    }`}
                  ></div>
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                          hasPartner
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}
                      >
                        {hasPartner ? (
                          <Users className="w-6 h-6 text-white" />
                        ) : (
                          <UserCheck className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                          hasPartner ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {hasPartner ? "Working With" : "Working Mode"}
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        {hasPartner ? activeShift.partner_name : "Working Solo"}
                      </p>
                      {hasPartner && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Team collaboration active
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md transform hover:scale-[1.02]"
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
