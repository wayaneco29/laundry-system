"use client";

import { Building2, MapPin, FileText, Hash, Eye } from "lucide-react";

type BranchTableProps = {
  data: Array<Record<string, string>>;
  onView: (branch: Record<string, string>) => void;
};

export const BranchTable = ({ data, onView }: BranchTableProps) => {
  // Mobile Card Component
  const MobileBranchCard = ({
    branch,
    index,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    branch: any;
    index: number;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-3">
      {/* Header with branch name and ID */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
              {index + 1}
            </div>
            <Building2 className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-slate-800 text-sm truncate">
              {branch?.name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono pl-8">
            <Hash className="w-3 h-3" />
            <span className="truncate">{branch?.id}</span>
          </div>
        </div>
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
          onClick={() => onView(branch)}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <div className="flex items-start gap-2 text-xs text-slate-600">
        <FileText className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
        <span className="truncate">{branch?.description}</span>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
        <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
        <span className="truncate">{branch?.address}</span>
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
              data?.map((branch, index) => (
                <MobileBranchCard
                  key={branch.id}
                  branch={branch}
                  index={index}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <div className="text-base font-medium mb-2">
                  No branches found
                </div>
                <p className="text-sm">
                  Branches will appear here when available.
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
              <div className="col-span-3">BRANCH DETAILS</div>
              <div className="col-span-4 text-center">DESCRIPTION</div>
              <div className="col-span-3 text-center">ADDRESS</div>
              <div className="col-span-1 text-center">ACTION</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {!!data?.length ? (
              data?.map((branch, index) => (
                <div
                  key={branch.id}
                  className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition-colors duration-150"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="col-span-3 space-y-1">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>{branch?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-mono">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span>{branch?.id}</span>
                    </div>
                  </div>

                  <div className="col-span-4 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-700 text-sm">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="truncate">{branch?.description}</span>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-700 text-sm max-w-full">
                      <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{branch?.address}</span>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150 hover:scale-110 transform"
                      onClick={() => onView(branch)}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">
                  No branches found
                </div>
                <p>Branches will appear here when available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
