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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
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
            {isLoading ? (
              <tr className="relative">
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
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
              data?.map((customer, index) => (
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
      <div className="p-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
};
