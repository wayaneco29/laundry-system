"use client";

import { twMerge } from "tailwind-merge";
import { 
  Package, 
  DollarSign, 
  Hash, 
  Edit3,
  CheckCircle,
  XCircle
} from "lucide-react";

type ServiceTableProps = {
  data: Array<Record<string, string>>;
  onEdit: (service: Record<string, string>) => void;
};

export const ServiceTable = ({ data, onEdit }: ServiceTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Mobile Card Component
  const MobileServiceCard = ({ service, index }: { service: any; index: number }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-3">
      {/* Header with service name and ID */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
              {index + 1}
            </div>
            <Package className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-slate-800 text-sm truncate">
              {service?.name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono pl-8">
            <Hash className="w-3 h-3" />
            <span className="truncate">{service?.id}</span>
          </div>
        </div>
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
          onClick={() => onEdit(service)}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Price and Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Price:</span>
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md">
            <DollarSign className="w-3 h-3 text-slate-500" />
            <span className="text-xs font-medium text-slate-700">
              ₱{service?.price}/KG
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Status:</span>
          <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(service?.status)}`}>
            {service?.status === "Active" ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            <span>{service?.status}</span>
          </div>
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
              data?.map((service, index) => (
                <MobileServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <div className="text-base font-medium mb-2">
                  No services found
                </div>
                <p className="text-sm">
                  Services will appear here when available.
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
              <div className="col-span-5">SERVICE DETAILS</div>
              <div className="col-span-3 text-center">PRICE</div>
              <div className="col-span-2 text-center">STATUS</div>
              <div className="col-span-1 text-center">ACTION</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {!!data?.length ? (
              data?.map((service, index) => (
                <div
                  key={service.id}
                  className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition-colors duration-150"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="col-span-5 space-y-1">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span>{service?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-mono">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span>{service?.id}</span>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span>₱{service?.price}/KG</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border ${getStatusColor(service?.status)}`}>
                      {service?.status === "Active" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{service?.status}</span>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150 hover:scale-110 transform"
                      onClick={() => onEdit(service)}
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">No services found</div>
                <p>Services will appear here when available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};