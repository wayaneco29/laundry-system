"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/app/components/common";
import { Clock, User, Package, Building } from "lucide-react";
import { getInventoryHistory } from "@/app/actions";

type InventoryHistoryModalProps = {
  show: boolean;
  stockId: string;
  stockName: string;
  onClose: () => void;
};

type HistoryItem = {
  id: string;
  stock_id: string;
  branch_id: string;
  quantity: number;
  action_type: "initial" | "update";
  staff_id: string;
  created_at: string;
  staff_name: string;
  staff_email: string;
  staff_full_name: string;
  staff_full_name_from_view: string;
  stock_name: string;
  branch_name: string;
};

export function InventoryHistoryModal({
  show,
  stockId,
  stockName,
  onClose,
}: InventoryHistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (show && stockId) {
      fetchHistory();
    }
  }, [show, stockId, currentPage]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const result = await getInventoryHistory({
        stockId,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (result.data) {
        setHistory(result.data as HistoryItem[]);
        setTotalCount(result.count || 0);
      }
    } catch (error) {
      console.error("Error fetching inventory history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadgeClass = (actionType: string) => {
    return actionType === "initial"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <Modal
      title={`Inventory History - ${stockName}`}
      show={show}
      onClose={onClose}
      size="2xl"
      footer={
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Showing {history.length} of {totalCount} records
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-gray-50 rounded">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No history records found for this item.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      {formatDate(item.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(
                        item.action_type,
                      )}`}
                    >
                      {item.action_type === "initial" ? "Initial" : "Update"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Package className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      {item.quantity}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      {item.staff_full_name_from_view ||
                        item?.staff_email ||
                        item.staff_full_name ||
                        item.staff_name ||
                        "Unknown"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      {item.branch_name || "Unknown"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
