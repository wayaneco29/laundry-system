"use client";

import moment from "moment";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Select } from "./common";
import {
  ChevronDown,
  Edit3,
  Eye,
  Calendar,
  User,
  Hash,
  Loader2,
  MapPin,
  Phone,
  CreditCard,
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

  const handleOrderStatusClick = (orderId: string, currentStatus: string) => {
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

  // Mobile Card Component
  const MobileOrderCard = ({ order, index }: { order: any; index: number }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-3">
      {/* Header with customer name and order number */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
              {index + 1}
            </div>
            <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-slate-800 text-sm truncate">
              {order?.customer_name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono pl-8">
            <Hash className="w-3 h-3" />
            <span className="truncate">{order?.order_id}</span>
          </div>
        </div>
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
          onClick={() => router.push(`/orders/${order?.order_id}`)}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Date and Branch */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{moment(order?.date_ordered).format("MMM DD, YYYY")}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span className="font-medium text-slate-700">
            {order?.branch_name}
          </span>
        </div>
      </div>

      {/* Status badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">
            Order Status:
          </span>
          <StatusBadge
            status={order?.order_status}
            type="order"
            orderId={order?.order_id}
            onClick={() =>
              handleOrderStatusClick(order?.order_id, order?.order_status)
            }
            isLoading={loadingOrders.has(order?.order_id)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Payment:</span>
          <StatusBadge
            status={order?.payment_status}
            type="payment"
            orderId={order?.order_id}
            onClick={() =>
              handlePaymentStatusClick(order?.order_id, order?.payment_status)
            }
            isLoading={loadingOrders.has(order?.order_id)}
          />
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-600">
          Total Amount:
        </span>
        <div className="text-slate-800 font-bold text-lg">
          ₱ {order?.total_price}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6">
      <div className="mx-auto">
        {/* Mobile View */}
        <div className="block lg:hidden">
          <div className="space-y-3">
            {!!data?.length ? (
              data?.map((order, index) => (
                <MobileOrderCard
                  key={order.order_id}
                  order={order}
                  index={index}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
                <div className="text-base font-medium mb-2">
                  No orders found
                </div>
                <p className="text-sm">
                  Orders will appear here when available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block bg-white rounded-md shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-white font-semibold text-sm">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">ORDER DETAILS</div>
              <div className="col-span-2 text-center">BRANCH</div>
              <div className="col-span-2 text-center">ORDER STATUS</div>
              <div className="col-span-2 text-center">PAYMENT STATUS</div>
              <div className="col-span-1 text-center">AMOUNT</div>
              <div className="col-span-1 text-center">ACTION</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {!!data?.length ? (
              data?.map((order, index) => (
                <div
                  key={order.order_id}
                  className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition-colors duration-150"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="col-span-3 space-y-1">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{order?.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>
                        {moment(order?.date_ordered).format("MMMM DD, YYYY")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-mono">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span>{order?.order_id}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium text-sm">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>{order?.branch_name}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <StatusBadge
                      status={order?.order_status}
                      type="order"
                      orderId={order?.order_id}
                      onClick={() =>
                        handleOrderStatusClick(
                          order?.order_id,
                          order?.order_status
                        )
                      }
                      isLoading={loadingOrders.has(order?.order_id)}
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <StatusBadge
                      status={order?.payment_status}
                      type="payment"
                      orderId={order?.order_id}
                      onClick={() =>
                        handlePaymentStatusClick(
                          order?.order_id,
                          order?.payment_status
                        )
                      }
                      isLoading={loadingOrders.has(order?.order_id)}
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    <div className="text-slate-800 font-bold text-lg">
                      ₱ {order?.total_price}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150 hover:scale-110 transform"
                      onClick={() => router.push(`/orders/${order?.order_id}`)}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <div className="text-lg font-medium mb-2">No orders found</div>
                <p>Orders will appear here when available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {/* <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-slate-600 gap-3 sm:gap-0">
          <div>Showing {data?.length || 0} orders</div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-200 rounded-full"></div>
              <span>Paid</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-200 rounded-full"></div>
              <span>Unpaid</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-200 rounded-full"></div>
              <span>Pending</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};
