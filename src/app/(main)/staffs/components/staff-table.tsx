"use client";

import moment from "moment";
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "@/app/components/common/pagination";
import { getAllStaffs } from "@/app/actions/staff/get_all_staffs";

type StaffTableProps = {
  initialData?: Array<Record<string, string>>;
  totalCount?: number;
  onEdit: (staff: Record<string, string>) => void;
  search?: string;
};

export const StaffTable = ({
  initialData = [],
  totalCount = 0,
  onEdit,
  search,
}: StaffTableProps) => {
  const [data, setData] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(totalCount);

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const result = await getAllStaffs({
        page,
        limit,
        search,
      });
      setData(result.data || []);
      setTotalItems(result.count || 0);
    } catch (error) {
      console.error("Error fetching staffs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, search, initialData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Staff Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Employment Date
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
            {loading ? (
              <tr className="relative">
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center bg-white">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No staffs found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Get started by creating your first staff record.
                  </p>
                </td>
              </tr>
            ) : (
              data?.map((staff, index) => (
                <tr key={staff.staff_id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap bg-white">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {staff.full_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap bg-white">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{staff.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap bg-white">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {staff.email || "No email"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap bg-white">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {moment(staff.employment_date).format("MMM DD, YYYY")}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-white">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {staff.address || "No address"}
                      </div>
                    </div>
                  </td>
                  <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm">
                    <button
                      onClick={() => onEdit(staff)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-x-1 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
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
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
};
