"use client";

import {
  Package,
  DollarSign,
  Edit2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "@/app/components/common/pagination";
import { getAllServices } from "@/app/actions";
import { useUserContext } from "@/app/context";

type ServiceTableProps = {
  initialData: Array<Record<string, string>>;
  onEdit: (service: Record<string, string>) => void;
  search?: string;
};

export const ServiceTable = ({
  initialData,
  onEdit,
  search,
}: ServiceTableProps) => {
  const [data, setData] = useState<Array<Record<string, string>>>(
    initialData || []
  );
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  const { role_name } = useUserContext();

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const result = await getAllServices({
        page,
        limit,
        search,
      });
      setData(result.data || []);
      setTotalItems(result.count || 0);
    } catch (error) {
      console.error("Error fetching services:", error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Inactive":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider min-w-40">
                Service Name
              </th>
              {role_name === "ADMIN" && (
                <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                  Branch
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider w-40">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider w-40">
                Status
              </th>
              <th className="sticky right-0 px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider w-40">
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
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No services
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first service.
                  </p>
                </td>
              </tr>
            ) : (
              data.map((service, index) => (
                <tr key={service.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {service.name}
                      </div>
                    </div>
                  </td>
                  {role_name === "ADMIN" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {service.branch_name}
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        ₱ {service.price}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        service.status
                      )}`}
                    >
                      {service.status === "Active" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {service.status}
                    </span>
                  </td>
                  <td className="sticky right-0 bg-white hover:bg-gray-50 px-6 py-4 whitespace-nowrap text-start text-sm font-medium shadow-sm">
                    <button
                      type="button"
                      onClick={() => onEdit(service)}
                      className="text-blue-600 inline-flex items-start gap-x-1 cursor-pointer"
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
