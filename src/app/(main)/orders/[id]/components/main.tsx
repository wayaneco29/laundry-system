"use client";

import moment from "moment";
import { Button } from "@/app/components/common";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { useState } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { updatePaymentStatus, updateOrderStatus } from "@/app/actions";
import "./receipt.css";

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
  const { userId } = useCurrentUser();
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

  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 3000);
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

      setEditingField(null);
      showMessage(`Order status updated to "${newStatus}" successfully!`);
    } catch (error) {
      console.error(error);
      showMessage("Failed to update order status. Please try again.", true);
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

      setEditingField(null);
      showMessage(`Payment status updated to "${newStatus}" successfully!`);
      window.location.reload();
    } catch (error) {
      console.error(error);
      showMessage("Failed to update payment status. Please try again.", true);
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
          className={`appearance-none pr-8 pl-3 py-2 text-sm rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
          <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
        ) : (
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
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

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border font-medium transition-all duration-200 ${
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
        <span className="uppercase">{status}</span>
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
        ) : (
          !isPaidStatus && (
            <Edit3 className="w-3 h-3 opacity-60 flex-shrink-0" />
          )
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex w-full items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order Details
                </h1>
                <p className="text-slate-600 mt-1">
                  View and manage order information
                </p>
              </div>
              <Button
                leftIcon={<ArrowLeft className="size-4" />}
                variant="outline"
                onClick={() => router.replace("/orders")}
                className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
              >
                Back to Orders
              </Button>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Items Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Items
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Services included in this order
                  </p>
                </div>

                <div className="overflow-x-auto">
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  {data?.payment_status === "Unpaid" && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
                      <CreditCard className="size-4" />
                      Add Payment
                    </Button>
                  )}
                  <Button
                    leftIcon={<Printer className="size-4" />}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                    onClick={() => window.print()}
                  >
                    Print Receipt
                  </Button>
                </div>
              </div>
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
