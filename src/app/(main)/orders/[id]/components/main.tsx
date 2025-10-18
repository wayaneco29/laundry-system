"use client";

import moment from "moment";
import { Button } from "@/app/components/common";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Printer,
  CreditCard,
  CheckCircle,
  XCircle,
  Calendar,
  Store,
  FileText,
  ChevronDown,
  Edit3,
  Loader2,
  AlertCircle,
  Check,
  X,
  Bluetooth,
  BluetoothConnected,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { updatePaymentStatus, updateOrderStatus } from "@/app/actions";
import { twMerge } from "tailwind-merge";
import { useToast } from "@/app/hooks";
import { usePrinterContext } from "@/app/context/PrinterContext";

import "./receipt.css";
import { useUserContext } from "@/app/context";

type MainOrderIdPageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

const Receipt = ({ data }: MainOrderIdPageProps) => {
  return (
    <div className="receipt-container">
      <div className="receipt-content">
        <div className="text-center">
          <h2 className="text-xl font-bold">Laundry Shop Inc.</h2>
          <p className="text-sm">123 Main Street, Anytown, USA</p>
          <p className="text-sm">Tel: (123) 456-7890</p>
        </div>
        <div className="my-4 border-t border-dashed" />
        <div className="flex justify-between">
          <p className="text-sm">Order Number:</p>
          <p className="text-sm font-mono">#{data?.order_id}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Date:</p>
          <p className="text-sm font-mono">
            {moment(data?.order_date).format("MM/DD/YYYY, h:mm A")}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Branch:</p>
          <p className="text-sm font-mono">{data?.branch_name}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Cashier:</p>
          <p className="text-sm font-mono">{data?.staff_name || "N/A"}</p>
        </div>
        <div className="my-4 border-t border-dashed" />
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-sm">Item</th>
              <th className="text-center text-sm">Qty</th>
              <th className="text-right text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((item: any, index: number) => (
              <tr key={index}>
                <td className="text-left text-sm">{item.name}</td>
                <td className="text-center text-sm">{item.quantity}kg</td>
                <td className="text-right text-sm">₱{item.total || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="my-4 border-t border-dashed" />
        <div className="flex justify-between">
          <p className="text-sm">Subtotal:</p>
          <p className="text-sm font-mono">₱{data?.total_price}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Tax:</p>
          <p className="text-sm font-mono">₱0.00</p>
        </div>
        <div className="my-2 border-t border-dashed" />
        <div className="flex justify-between font-bold">
          <p className="text-lg">Total:</p>
          <p className="text-lg font-mono">₱{data?.total_price}</p>
        </div>
        <div className="my-4 border-t border-dashed" />
        <div className="text-center pb-10">
          <p className="text-xs">Thank you for your business!</p>
        </div>
        <div className="my-2 border-t border-dashed" />
      </div>
    </div>
  );
};

export const MainOrderIdPage = ({ data }: MainOrderIdPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useCurrentUser();
  const toast = useToast();
  const { isConnected, isConnecting, isPrinting, printReceipt, connect } =
    usePrinterContext();
  const { username } = useUserContext();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const orderStatuses = [
    "Pending",
    "Ongoing",
    "Ready for Pickup",
    "Picked up",
    "Cancelled",
  ];
  const paymentStatuses = ["Unpaid", "Paid", "Refunded"];

  // Handle thermal printing
  const handlePrint = useCallback(async () => {
    if (!data) return;

    const receiptData = {
      order_id: data.order_id,
      order_date: moment(data.order_date).format("MM/DD/YYYY, h:mm A"),
      branch_name: data.branch_name,
      staff_name: username,
      items: data.items || [],
      total_price: data.total_price,
    };

    await printReceipt(receiptData);
  }, [data, printReceipt]);

  // Auto-trigger print when redirected from order creation
  useEffect(() => {
    const shouldPrint = searchParams.get("print");
    if (shouldPrint === "true" && data?.payment_status === "Paid") {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, data?.payment_status, handlePrint]);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Ongoing":
        return "bg-purple-100 text-purple-800 border-purple-200";
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

  const handleUpdateOrderStatus = async (newStatus: string) => {
    if (newStatus === data?.order_status) {
      setEditingField(null);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await updateOrderStatus({
        p_order_id: data?.order_id,
        p_order_status: newStatus,
        p_staff_id: userId!, // Use authenticated user ID
      });

      if (error) throw error;

      toast.success(`Order status updated to "${newStatus}" successfully!`);

      setEditingField(null);
    } catch (error) {
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (newStatus: string) => {
    if (newStatus === data?.payment_status) {
      setEditingField(null);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await updatePaymentStatus({
        p_order_id: data?.order_id,
        p_payment_status: newStatus,
        p_staff_id: userId!, // Use authenticated user ID
      });

      if (error) throw error;

      toast.success(`Payment status updated to "${newStatus}" successfully!`);
      setEditingField(null);
    } catch (error) {
      toast.error("Failed to update payment status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const StatusDropdown = ({
    currentStatus,
    field,
    options,
    onUpdate,
  }: {
    currentStatus: string;
    field: string;
    options: string[];
    onUpdate: (newStatus: string) => void;
  }) => {
    return (
      <div className="relative">
        <select
          value={currentStatus}
          onChange={(e) => onUpdate(e.target.value)}
          onBlur={() => setEditingField(null)}
          className={`appearance-none pr-10 pl-3 md:pl-4 py-3 text-sm md:text-base min-h-[44px] rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
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
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin" />
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
        )}
      </div>
    );
  };

  const StatusBadge = ({
    status,
    type,
    onClick,
  }: {
    status: string;
    type: "order" | "payment";
    onClick: () => void;
  }) => {
    const isEditing = editingField === `${type}_status`;

    if (isEditing) {
      return (
        <StatusDropdown
          currentStatus={status}
          field={`${type}_status`}
          options={type === "order" ? orderStatuses : paymentStatuses}
          onUpdate={(newStatus) => {
            if (type === "order") {
              handleUpdateOrderStatus(newStatus);
            } else {
              handleUpdatePaymentStatus(newStatus);
            }
          }}
        />
      );
    }

    const isPaidStatus = type === "payment" && status === "Paid";
    const isPickupStatus = type === "order" && status === "Picked up";

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-3 text-sm md:text-base min-h-[44px] rounded-lg border font-medium transition-all duration-200 ${
          type === "order"
            ? getOrderStatusColor(status)
            : getPaymentStatusColor(status)
        } ${
          isPaidStatus || isPickupStatus
            ? "opacity-75 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md active:scale-95"
        }`}
        onClick={isPaidStatus || isPickupStatus ? undefined : onClick}
      >
        <span className="uppercase">{status}</span>
        {isLoading
          ? editingField === type && (
              <Loader2
                className={twMerge(
                  "w-4 h-4 animate-spin flex-shrink-0",
                  type === "order"
                    ? getOrderStatusColor(status)
                    : getPaymentStatusColor(status)
                )}
              />
            )
          : !isPaidStatus &&
            !isPickupStatus && (
              <Edit3 className="w-4 h-4 opacity-60 flex-shrink-0" />
            )}
      </div>
    );
  };

  return (
    <div>
      <div className="no-print">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mx-auto p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <button
              onClick={() => router.replace("/orders")}
              className="inline-flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-base min-h-[44px] w-fit active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Orders</span>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Order Details
              </h1>
              <p className="text-slate-600 mt-1 text-sm md:text-base">
                View and manage order information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Header Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Laundry Shop Inc.
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Professional Laundry Services
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm1:grid-cols-2 gap-6">
                    {/* Order Status - Editable */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <FileText className="size-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">
                          Order Status
                        </p>
                        <StatusBadge
                          status={data?.order_status}
                          type="order"
                          onClick={() => setEditingField("order_status")}
                        />
                      </div>
                    </div>

                    {/* Payment Status - Editable */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <CheckCircle className="size-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">
                          Payment Status
                        </p>
                        <StatusBadge
                          status={data?.payment_status}
                          type="payment"
                          onClick={() => setEditingField("payment_status")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table/Cards */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Order Items
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">
                    Services included in this order
                  </p>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                  {data?.items?.length ? (
                    <div className="divide-y divide-slate-200">
                      {data.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                                </span>
                                <h4 className="text-sm font-semibold text-slate-900 truncate">
                                  {item.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                                <span className="bg-slate-100 px-2 py-1 rounded">
                                  ₱{item.price}/kg
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                  {item.quantity} kg
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <span className="text-xs font-medium text-slate-600">
                              Item Total
                            </span>
                            <span className="text-base font-bold text-slate-900">
                              ₱{item.total || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-sm font-medium">No services added</p>
                        <p className="text-xs mt-1">
                          Services will appear here when added to the order
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Price/KG
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data?.items?.length ? (
                        data.items.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-900">
                                {item.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-slate-700">
                              ₱{item.price}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.quantity} kg
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                              ₱{item.total || 0}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="text-slate-400">
                              <FileText className="size-12 mx-auto mb-4" />
                              <p className="text-sm font-medium">
                                No services added
                              </p>
                              <p className="text-xs mt-1">
                                Services will appear here when added to the
                                order
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium text-slate-600">
                      ₱{data?.total_price}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium text-slate-600">₱0.00</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ₱{data?.total_price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {data?.payment_status === "Paid" && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions
                  </h3>
                  <div className="space-y-3">
                    {/* Printer Connection Status */}
                    {isConnected && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <BluetoothConnected className="size-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">
                          Printer Connected
                        </span>
                      </div>
                    )}

                    {/* Print Receipt Button */}
                    <Button
                      leftIcon={
                        isPrinting ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <Printer className="size-5" />
                        )
                      }
                      className="w-full min-h-[48px] md:min-h-[44px] focus:!ring-0 text-base bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handlePrint}
                      disabled={isPrinting || isConnecting}
                    >
                      {isPrinting
                        ? "Printing..."
                        : isConnecting
                        ? "Connecting..."
                        : "Print Receipt"}
                    </Button>

                    {/* Connect/Disconnect Button */}
                    {!isConnected && (
                      <Button
                        leftIcon={
                          isConnecting ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <Bluetooth className="size-5" />
                          )
                        }
                        className="w-full min-h-[48px] md:min-h-[44px] text-base bg-blue-600 focus:!ring-0 hover:bg-blue-700 text-white flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                        onClick={connect}
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Connecting..." : "Connect Printer"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="print-only">
        <Receipt data={data} />
      </div>
    </div>
  );
};
