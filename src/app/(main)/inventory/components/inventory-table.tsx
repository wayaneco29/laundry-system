"use client";

import { Edit2, Package, AlertTriangle, Loader2 } from "lucide-react";
import { Pagination } from "@/app/components/common/pagination";

type InventoryTableProps = {
  data: Array<Record<string, any>>;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (item: Record<string, any>) => void;
};

export function InventoryTable({
  data,
  totalCount,
  currentPage,
  itemsPerPage,
  isLoading,
  onPageChange,
  onLimitChange,
  onEdit,
}: InventoryTableProps) {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return "text-red-600 bg-red-100";
    if (quantity <= 10) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getStockIcon = (quantity: number) => {
    if (quantity === 0 || quantity <= 10) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Package className="h-4 w-4" />;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider min-w-40">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium bg-blue-600 text-white uppercase tracking-wider">
                Status
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
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No inventory items
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No items found for the selected branch.
                  </p>
                </td>
              </tr>
            ) : (
              data?.map((item, index) => (
                <tr
                  key={`${item.branch_id}-${item.id || index}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {item?.stock_name || "Unnamed Item"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item?.branch_name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.quantity || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStockStatusColor(
                        item.quantity || 0
                      )}`}
                    >
                      {getStockIcon(item.quantity || 0)}
                      {getStockStatus(item.quantity || 0)}
                    </span>
                  </td>
                  <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 inline-flex items-center gap-x-1 px-2 py-1 rounded-md transition-colors duration-200"
                      title={`Edit ${item.name || "item"}`}
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
          totalPages={Math.ceil(totalCount / itemsPerPage) || 1}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onLimitChange}
        />
      </div>
    </div>
  );
}
