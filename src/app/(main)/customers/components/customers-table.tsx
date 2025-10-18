"use client";

import { User, Phone, Mail, MapPin, Eye, Loader2 } from "lucide-react";
import { Pagination } from "@/app/components/common/pagination";

type CustomersTableProps = {
  data: Array<Record<string, string>>;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onView: (customer: Record<string, string>) => void;
};

export const CustomersTable = ({
  data,
  totalCount,
  currentPage,
  itemsPerPage,
  isLoading,
  onPageChange,
  onItemsPerPageChange,
  onView,
}: CustomersTableProps) => {
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden">
        {!data || data.length === 0 ? (
          <div className="p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No customers
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first customer.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.map((customer, index) => (
              <div
                key={customer.customer_id || index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Customer Name */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center text-base font-semibold text-gray-900 mb-1">
                      <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="truncate">{customer.full_name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onView(customer)}
                    className="ml-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg active:scale-95 hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0 min-h-[44px]"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    {customer.phone || "No phone"}
                  </div>
                  {customer.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                {customer.address && (
                  <div className="flex items-start text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <MapPin className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider min-w-[180px]">
                Customer Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Address
              </th>
              <th className="sticky right-0 px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No customers
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first customer.
                  </p>
                </td>
              </tr>
            ) : (
              data.map((customer, index) => (
                <tr
                  key={customer.customer_id || index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap bg-white">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {customer.full_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap bg-white">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap bg-white">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {customer.email || "No email"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-white">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {customer.address || "No address"}
                      </div>
                    </div>
                  </td>
                  <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm">
                    <button
                      onClick={() => onView(customer)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-x-1 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Shows on both mobile and desktop */}
      {data && data.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};
