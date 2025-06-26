"use client";

import moment from "moment";
import {
  Tag,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/app/components/common/pagination";

type PromoTableProps = {
  data: Array<Record<string, string>>;
  totalCount: number;
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  };
  onEdit: (promo: Record<string, string>) => void;
};

export const PromoTable = ({
  data,
  totalCount,
  searchParams,
  onEdit,
}: PromoTableProps) => {
  const router = useRouter();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 15;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Expired":
        return "text-red-600 bg-red-100";
      case "Closed":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4" />;
      case "Expired":
        return <XCircle className="h-4 w-4" />;
      case "Closed":
        return <Clock className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No promos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first promo.
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
                Promo Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="sticky right-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((promo, index) => (
              <tr key={promo.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="text-sm font-medium text-gray-900">
                      {promo.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">
                    {promo.code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">
                      {promo.description || "No description"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">
                      {moment(promo.valid_until).format("MMM DD, YYYY")}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      promo.status
                    )}`}
                  >
                    {getStatusIcon(promo.status)}
                    {promo.status}
                  </span>
                </td>
                <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm">
                  <button
                    onClick={() => onEdit(promo)}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-x-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
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
