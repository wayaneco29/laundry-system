"use client";

import moment from "moment";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { Pagination } from "./common/pagination";
import {
  ChevronDown,
  Edit3,
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  Hash,
  Loader2,
  Search,
  MapPin,
  PinIcon,
} from "lucide-react";

import { getOrders, updatePaymentStatus, updateOrderStatus } from "../actions";
import "./loading-spinner.css";
import { useToast } from "../hooks";
import { useUserContext } from "../context";

type OrdersTableProps = {
  initialData?: Array<any>;
  totalCount?: number;
};

export const OrdersTable = ({
  initialData = [],
  totalCount = 0,
}: OrdersTableProps) => {
  const toast = useToast();
  const router = useRouter();
  const { userId } = useCurrentUser();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(totalCount);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [loadingOrderStatus, setLoadingOrderStatus] = useState<Set<string>>(
    new Set()
  );
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState<Set<string>>(
    new Set()
  );

  const { branch_id, role_name } = useUserContext();

  const orderStatuses = ["Pending", "Ready for Pickup", "Picked up"];
  const paymentStatuses = ["Unpaid", "Paid"];

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const result = await getOrders({
        page,
        limit,
        branchId: branch_id || undefined,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });

      if (result.data) {
        setData(result.data);
        setTotalItems(result.count || 0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch new data when pagination/search changes (not on initial load)
  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getOrderStatusColor = (status: string) => {
    const safeStatus = status || "Pending";
    switch (safeStatus) {
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ready for Pickup":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Picked up":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const safeStatus = status || "Unpaid";
    switch (safeStatus) {
      case "Unpaid":
        return "bg-red-100 text-red-800 border-red-200";
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "Refunded":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleUpdateOrderStatus = async (
    p_order_id: string,
    p_order_status: string
  ) => {
    try {
      setLoadingOrderStatus((prev) => new Set(prev).add(p_order_id));
      const { error } = await updateOrderStatus({
        p_order_id,
        p_order_status,
        p_staff_id: userId!,
      });
      if (error) throw error;
      setEditingCell(null);
      // Refresh data after update
      fetchData(currentPage, itemsPerPage);

      toast.success(`${p_order_id} updated to ${p_order_status} successfully.`);
    } catch (error) {
      toast.error(`Failed tp update ${p_order_id}.`);
    } finally {
      setLoadingOrderStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(p_order_id);
        return newSet;
      });
    }
  };

  const handleUpdatePaymentStatus = async (
    p_order_id: string,
    p_payment_status: string
  ) => {
    try {
      setLoadingPaymentStatus((prev) => new Set(prev).add(p_order_id));
      const { error } = await updatePaymentStatus({
        p_order_id,
        p_payment_status,
        p_staff_id: userId!,
      });
      if (error) throw error;
      setEditingCell(null);
      // Refresh data after update
      fetchData(currentPage, itemsPerPage);
      toast.success(
        `${p_order_id} updated to ${p_payment_status} successfully.`
      );
    } catch (error) {
      toast.error(`Failed tp update ${p_order_id}.`);
      console.error(error);
    } finally {
      setLoadingPaymentStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(p_order_id);
        return newSet;
      });
    }
  };

  const handleOrderStatusClick = (orderId: string) => {
    setEditingCell(`${orderId}-order_status`);
  };

  const handlePaymentStatusClick = (orderId: string, currentStatus: string) => {
    if (currentStatus === "Paid") {
      return;
    }
    setEditingCell(`${orderId}-payment_status`);
  };

  const StatusDropdown = ({
    orderId,
    currentStatus,
    field,
    options,
    onUpdate,
    isLoading,
  }: {
    orderId: string;
    currentStatus: string;
    field: string;
    options: string[];
    onUpdate: (orderId: string, newStatus: string) => void;
    isLoading?: boolean;
  }) => {
    return (
      <div className="relative">
        <select
          value={currentStatus}
          onChange={(e) => onUpdate(orderId, e.target.value)}
          onBlur={() => setEditingCell(null)}
          className={`appearance-none pr-6 pl-2 py-1 text-xs sm:py-2 sm:pl-3 sm:pr-8 sm:text-sm rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            field === "order_status"
              ? getOrderStatusColor(currentStatus)
              : getPaymentStatusColor(currentStatus)
          }`}
          autoFocus
          disabled={isLoading}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {isLoading ? (
          <Loader2 className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
        ) : (
          <ChevronDown className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
        )}
      </div>
    );
  };

  const StatusBadge = ({
    status,
    type,
    orderId,
    onClick,
    isLoading,
  }: {
    status: string;
    type: "order" | "payment";
    orderId: string;
    onClick: () => void;
    isLoading?: boolean;
  }) => {
    // Handle undefined or null status
    const safeStatus = status || (type === "order" ? "Pending" : "Unpaid");

    const isEditing =
      editingCell ===
      `${orderId}-${type === "order" ? "order_status" : "payment_status"}`;

    if (isEditing) {
      return (
        <StatusDropdown
          orderId={orderId}
          currentStatus={safeStatus}
          field={type === "order" ? "order_status" : "payment_status"}
          options={type === "order" ? orderStatuses : paymentStatuses}
          onUpdate={(id, newStatus) => {
            if (type === "order") {
              handleUpdateOrderStatus(id, newStatus);
            } else {
              handleUpdatePaymentStatus(id, newStatus);
            }
          }}
          isLoading={isLoading}
        />
      );
    }

    const isPaidStatus =
      (type === "payment" && safeStatus === "Paid") ||
      (type === "order" && safeStatus === "Picked up");

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs sm:gap-2 sm:px-3 sm:py-2 sm:text-sm rounded-lg border font-medium transition-all duration-200 ${
          type === "order"
            ? getOrderStatusColor(safeStatus)
            : getPaymentStatusColor(safeStatus)
        } ${
          isPaidStatus
            ? "opacity-75 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md"
        }`}
        onClick={isPaidStatus ? undefined : onClick}
      >
        <span className="uppercase truncate">{safeStatus}</span>
        {isLoading ? (
          <Loader2 className="w-2 h-2 sm:w-3 sm:h-3 animate-spin flex-shrink-0" />
        ) : (
          !isPaidStatus && (
            <Edit3 className="w-2 h-2 sm:w-3 sm:h-3 opacity-60 flex-shrink-0" />
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col items-center sm:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 h-10 text-sm pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-3 py-2 h-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Ready for Pickup">Ready for Pickup</option>
          <option value="Picked up">Picked up</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
        {loading && (!data || data.length === 0) ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="bg-blue-600 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="bg-blue-600 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Customer
                    </th>
                    {role_name === "ADMIN" && (
                      <th className="bg-blue-600 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Branch
                      </th>
                    )}
                    <th className="bg-blue-600 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-40">
                      Order Status
                    </th>
                    <th className="bg-blue-600 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-48">
                      Payment Status
                    </th>
                    <th className="bg-blue-600 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-40">
                      Total
                    </th>
                    <th className="bg-blue-600 sticky right-0 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!data || data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Hash className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No orders
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your first order.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    data.map((order, index) => (
                      <tr
                        key={order?.order_id || index}
                        className={`hover:bg-gray-50 ${
                          loading ? "opacity-75" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap bg-white">
                          <div className="flex items-center">
                            {/* <Hash className="h-5 w-5 text-gray-400 mr-3" /> */}
                            <div>
                              <div className="flex items-center text-sm font-medium text-gray-900">
                                <Hash className="h-4 w-4 text-gray-400 mr-1" />
                                {order?.order_id || "N/A"}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {order?.created_at
                                  ? moment(order.created_at).isValid()
                                    ? moment(order.created_at).format(
                                        "MMM DD, YYYY"
                                      )
                                    : "Invalid Date"
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap bg-white">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {order?.customer_name || "N/A"}
                            </div>
                          </div>
                          {order?.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">
                                {order?.phone || "N/A"}
                              </div>
                            </div>
                          )}
                          {order?.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">
                                {order?.email || "N/A"}
                              </div>
                            </div>
                          )}
                        </td>
                        {role_name === "ADMIN" && (
                          <td className="px-6 py-4 whitespace-nowrap bg-white">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">
                                {order?.branch_name || "N/A"}
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap bg-white">
                          <StatusBadge
                            status={order?.order_status || "Pending"}
                            type="order"
                            orderId={order?.order_id || ""}
                            onClick={() =>
                              handleOrderStatusClick(order?.order_id || "")
                            }
                            isLoading={loadingOrderStatus.has(
                              order?.order_id || ""
                            )}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap bg-white">
                          <StatusBadge
                            status={order?.payment_status || "Unpaid"}
                            type="payment"
                            orderId={order?.order_id || ""}
                            onClick={() =>
                              handlePaymentStatusClick(
                                order?.order_id || "",
                                order?.payment_status || "Unpaid"
                              )
                            }
                            isLoading={loadingPaymentStatus.has(
                              order?.order_id || ""
                            )}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap bg-white">
                          <div className="text-sm font-medium text-gray-900">
                            ₱{order?.total_price || "0"}
                          </div>
                        </td>
                        <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm ">
                          <button
                            onClick={() =>
                              router.push(`/orders/${order?.order_id || ""}`)
                            }
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

            {/* Pagination */}
            {data && data.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(totalPages, 1)}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
