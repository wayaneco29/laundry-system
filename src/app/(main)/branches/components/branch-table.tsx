"use client";

import { Building2, MapPin, FileText, Eye, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "@/app/components/common/pagination";
import { getAllBranches } from "@/app/actions";

type BranchTableProps = {
  initialData: Array<Record<string, string>>;
  onView: (branch: Record<string, string>) => void;
  search?: string;
};

export const BranchTable = ({
  initialData,
  onView,
  search,
}: BranchTableProps) => {
  const [data, setData] = useState<Array<Record<string, string>>>(
    initialData || []
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const result = await getAllBranches({
        page,
        limit,
        search,
      });
      setData(result.data || []);
      setTotalItems(result.count || 0);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, search]);

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
                Branch Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Description
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
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No branches
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first branch.
                  </p>
                </td>
              </tr>
            ) : (
              data?.map((branch, index) => (
                <tr key={branch.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap bg-white">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {branch.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-white">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {branch.description || "No description"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-white">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {branch.address || "No address"}
                      </div>
                    </div>
                  </td>
                  <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm">
                    <button
                      onClick={() => onView(branch)}
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
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
};
