"use client";

import moment from "moment";
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Hash, 
  Edit3,
  UserCircle2,
  User
} from "lucide-react";

type StaffTableProps = {
  data: Array<Record<string, string>>;
  onEdit: (staff: Record<string, string>) => void;
};

export const StaffTable = ({ data, onEdit }: StaffTableProps) => {
  // Mobile Card Component
  const MobileStaffCard = ({ staff, index }: { staff: any; index: number }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-3">
      {/* Header with staff name and ID */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
              {index + 1}
            </div>
            <UserCircle2 className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-slate-800 text-sm truncate">
              {staff?.full_name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono pl-8">
            <Hash className="w-3 h-3" />
            <span className="truncate">{staff?.staff_id}</span>
          </div>
        </div>
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
          onClick={() => onEdit(staff)}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Phone className="w-3 h-3 text-slate-400" />
          <span>{staff?.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Mail className="w-3 h-3 text-slate-400" />
          <span>{staff?.email || "N/A"}</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="truncate">{staff?.address}</span>
        </div>
      </div>

      {/* Employment Date */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-600">
          Date Hired:
        </span>
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span className="text-xs font-medium text-slate-700">
            {moment(staff?.employment_date).format("MMM DD, YYYY")}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6">
      <div className="mx-auto">
        {/* Mobile View */}
        <div className="block lg:hidden">
          <div className="space-y-3">
            {!!data?.length ? (
              data?.map((staff, index) => (
                <MobileStaffCard
                  key={staff.staff_id}
                  staff={staff}
                  index={index}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <div className="text-base font-medium mb-2">
                  No staff members found
                </div>
                <p className="text-sm">
                  Staff members will appear here when available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block bg-white rounded-md shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-white font-semibold text-sm">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">STAFF DETAILS</div>
              <div className="col-span-2 text-center">PHONE</div>
              <div className="col-span-2 text-center">EMAIL</div>
              <div className="col-span-2 text-center">EMPLOYMENT DATE</div>
              <div className="col-span-2 text-center">ADDRESS</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {!!data?.length ? (
              data?.map((staff, index) => (
                <div
                  key={staff.staff_id}
                  className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => onEdit(staff)}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="col-span-3 space-y-1">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <UserCircle2 className="w-4 h-4 text-slate-500" />
                      <span>{staff?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-mono">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span>{staff?.staff_id}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-700 text-sm">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{staff?.phone}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-700 text-sm">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span>{staff?.email || "N/A"}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{moment(staff?.employment_date).format("MMM DD, YYYY")}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-700 text-sm max-w-full">
                      <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{staff?.address}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">No staff members found</div>
                <p>Staff members will appear here when available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};