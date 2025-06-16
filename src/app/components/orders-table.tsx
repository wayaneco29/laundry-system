"use client";

import moment from "moment";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Edit3,
  Eye,
  Calendar,
  User,
  Hash,
  Loader2,
  MapPin,
} from "lucide-react";

import { updatePaymentStatus, updateOrderStatus } from "../actions";

type OrdersTableProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<any>;
};

export const OrdersTable = ({ data }: OrdersTableProps) => {
  const router = useRouter();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState<Set<string>>(new Set());

  const orderStatuses = [
    "Pending",
    "Ongoing",
    "Ready for Pickup",
    "Picked up",
    "Cancelled",
  ];
  const paymentStatuses = ["Unpaid", "Paid", "Refunded"];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ongoing":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "Ready for Pickup":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Picked up":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
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
      setLoadingOrders((prev) => new Set(prev).add(p_order_id));

      const { error } = await updateOrderStatus({
        p_order_id,
        p_order_status,
        p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
      });

      if (error) throw error;
      setEditingCell(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders((prev) => {
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
      setLoadingOrders((prev) => new Set(prev).add(p_order_id));

      const { error } = await updatePaymentStatus({
        p_order_id,
        p_payment_status,
        p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
      });

      if (error) throw error;
      setEditingCell(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders((prev) => {
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
    const isEditing =
      editingCell ===
      `${orderId}-${type === "order" ? "order_status" : "payment_status"}`;

    if (isEditing) {
      return (
        <StatusDropdown
          orderId={orderId}
          currentStatus={status}
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

    const isPaidStatus = type === "payment" && status === "Paid";

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs sm:gap-2 sm:px-3 sm:py-2 sm:text-sm rounded-lg border font-medium transition-all duration-200 ${
          type === "order"
            ? getOrderStatusColor(status)
            : getPaymentStatusColor(status)
        } ${
          isPaidStatus
            ? "opacity-75 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md"
        }`}
        onClick={isPaidStatus ? undefined : onClick}
      >
        <span className="uppercase truncate">{status}</span>
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

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
          <p className="mt-1 text-sm text-gray-500">
            Orders will appear here when they are created.
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
                Customer & Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="sticky right-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((order, index) => (
              <tr key={order.order_id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer_name}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        {order.order_id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-900">
                        {moment(order.order_date).format("MMM DD, YYYY")}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.branch_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    status={order.order_status}
                    type="order"
                    orderId={order.order_id}
                    onClick={() => handleOrderStatusClick(order.order_id)}
                    isLoading={loadingOrders.has(order.order_id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    status={order.payment_status}
                    type="payment"
                    orderId={order.order_id}
                    onClick={() =>
                      handlePaymentStatusClick(order.order_id, order.payment_status)
                    }
                    isLoading={loadingOrders.has(order.order_id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₱{order.total_price}
                  </div>
                </td>
                <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-sm">
                  <button
                    onClick={() => router.push(`/orders/${order.order_id}`)}
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
    </div>
  );
};
