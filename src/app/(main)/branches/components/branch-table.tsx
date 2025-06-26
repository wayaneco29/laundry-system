"use client";

import { Building2, MapPin, FileText, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/app/components/common/pagination";

type BranchTableProps = {
  data: Array<Record<string, string>>;
  totalCount: number;
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
  onView: (branch: Record<string, string>) => void;
};

export const BranchTable = ({
  data,
  totalCount,
  searchParams,
  onView,
}: BranchTableProps) => {
  const router = useRouter();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams({
      ...searchParams,
      page: String(page),
      limit: String(itemsPerPage),
    });
    router.push(`?${params.toString()}`);
  };

  const handleItemsPerPageChange = (limit: number) => {
    const params = new URLSearchParams({
      ...searchParams,
      page: "1",
      limit: String(limit),
    });
    router.push(`?${params.toString()}`);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No branches
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first branch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="sticky right-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((branch, index) => (
              <tr key={branch.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="text-sm font-medium text-gray-900">
                      {branch.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">
                      {branch.description || "No description"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
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
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
};
