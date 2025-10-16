"use client";

import { useState } from "react";
import { Button, ConfirmationDialog } from "@/app/components/common";
import {
  approveExpense,
  markExpensePaid,
  deleteExpense,
} from "@/app/actions/expense";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { Pagination } from "@/app/components/common/pagination";

import { Loader2 } from "lucide-react";
import { useUserContext } from "@/app/context";

type ExpenseTableProps = {
  data: Array<Record<string, any>>;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onEdit: (expense: any) => void;
  onView: (expense: any) => void;
  onShowToast?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
  onShowError?: (message: string) => void;
};

export function ExpenseTable({
  data,
  totalCount,
  currentPage,
  itemsPerPage,
  isLoading,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onView,
  onShowToast,
  onShowError,
}: ExpenseTableProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
  });

  const { userId } = useCurrentUser();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "Paid":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Supplies: "bg-purple-100 text-purple-800",
      Equipment: "bg-blue-100 text-blue-800",
      Utilities: "bg-green-100 text-green-800",
      Rent: "bg-orange-100 text-orange-800",
      Salaries: "bg-pink-100 text-pink-800",
      Marketing: "bg-indigo-100 text-indigo-800",
      Maintenance: "bg-yellow-100 text-yellow-800",
      Transportation: "bg-cyan-100 text-cyan-800",
      Insurance: "bg-red-100 text-red-800",
      Other: "bg-gray-100 text-gray-800",
    };

    return colors[category] || colors["Other"];
  };

  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "info" = "danger"
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleApprove = async (
    expenseId: string,
    status: "Approved" | "Rejected"
  ) => {
    if (!userId) {
      onShowToast?.("You must be logged in to perform this action", "error");
      return;
    }

    const action = async () => {
      setLoadingStates((prev) => ({
        ...prev,
        [`${expenseId}_${status}`]: true,
      }));

      try {
        const result = await approveExpense({
          expenseId,
          approvedBy: userId,
          status,
        });

        if (result.error) {
          const errorMessage =
            typeof result.error === "object" &&
            result.error !== null &&
            "message" in result.error
              ? result.error.message
              : String(result.error);
          onShowToast?.(
            `Error ${status.toLowerCase()} expense: ${
              errorMessage || "Unknown error"
            }`,
            "error"
          );
        } else {
          onShowToast?.(
            `Expense ${status.toLowerCase()} successfully`,
            "success"
          );
          // Refresh will be handled by parent component
        }
      } catch (error: any) {
        onShowToast?.(
          `Error ${status.toLowerCase()} expense: ${
            error.message || "Unknown error"
          }`,
          "error"
        );
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          [`${expenseId}_${status}`]: false,
        }));
      }
    };

    showConfirmDialog(
      `${status} Expense`,
      `Are you sure you want to ${status.toLowerCase()} this expense?`,
      action,
      status === "Rejected" ? "danger" : "warning"
    );
  };

  const handleMarkPaid = async (expenseId: string) => {
    if (!userId) {
      onShowToast?.("You must be logged in to perform this action", "error");
      return;
    }

    const action = async () => {
      setLoadingStates((prev) => ({ ...prev, [`${expenseId}_paid`]: true }));

      try {
        const result = await markExpensePaid(expenseId, userId);

        if (result.error) {
          const errorMessage =
            typeof result.error === "object" &&
            result.error !== null &&
            "message" in result.error
              ? result.error.message
              : String(result.error);
          onShowToast?.(
            `Error marking expense as paid: ${errorMessage || "Unknown error"}`,
            "error"
          );
        } else {
          onShowToast?.("Expense marked as paid successfully", "success");
          // Refresh will be handled by parent component
        }
      } catch (error: any) {
        onShowToast?.(
          `Error marking expense as paid: ${error.message || "Unknown error"}`,
          "error"
        );
      } finally {
        setLoadingStates((prev) => ({ ...prev, [`${expenseId}_paid`]: false }));
      }
    };

    showConfirmDialog(
      "Mark as Paid",
      "Are you sure you want to mark this expense as paid?",
      action,
      "warning"
    );
  };

  const handleDelete = async (expenseId: string, expenseTitle: string) => {
    if (!userId) {
      onShowToast?.("You must be logged in to perform this action", "error");
      return;
    }

    const action = async () => {
      setLoadingStates((prev) => ({ ...prev, [`${expenseId}_delete`]: true }));

      try {
        const result = await deleteExpense(expenseId);

        if (result.error) {
          const errorMessage =
            typeof result.error === "object" &&
            result.error !== null &&
            "message" in result.error
              ? result.error.message
              : String(result.error);
          onShowToast?.(
            `Error deleting expense: ${errorMessage || "Unknown error"}`,
            "error"
          );
        } else {
          onShowToast?.("Expense deleted successfully", "success");
          // Refresh will be handled by parent component
        }
      } catch (error: any) {
        onShowToast?.(
          `Error deleting expense: ${error.message || "Unknown error"}`,
          "error"
        );
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          [`${expenseId}_delete`]: false,
        }));
      }
    };

    showConfirmDialog(
      "Delete Expense",
      `Are you sure you want to permanently delete "${expenseTitle}"? This action cannot be undone.`,
      action,
      "danger"
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expense Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr className="relative">
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No expenses found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Get started by creating your first expense record.
                  </p>
                </td>
              </tr>
            ) : (
              data.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.title}
                      </div>
                      {expense.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {expense.description}
                        </div>
                      )}
                      {expense.is_recurring && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          🔄 {expense.recurring_frequency}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        expense.category
                      )}`}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {expense.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.expense_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.branch_name || "All Branches"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(expense)}
                      >
                        View
                      </Button>

                      {(expense.status === "Pending" ||
                        expense.status === "Rejected") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(expense)}
                        >
                          Edit
                        </Button>
                      )}

                      {expense.status === "Pending" && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleApprove(expense.id, "Approved")
                            }
                            disabled={loadingStates[`${expense.id}_Approved`]}
                          >
                            {loadingStates[`${expense.id}_Approved`]
                              ? "Approving..."
                              : "Approve"}
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleApprove(expense.id, "Rejected")
                            }
                            disabled={loadingStates[`${expense.id}_Rejected`]}
                          >
                            {loadingStates[`${expense.id}_Rejected`]
                              ? "Rejecting..."
                              : "Reject"}
                          </Button>
                        </>
                      )}

                      {expense.status === "Approved" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMarkPaid(expense.id)}
                          disabled={loadingStates[`${expense.id}_paid`]}
                        >
                          {loadingStates[`${expense.id}_paid`]
                            ? "Processing..."
                            : "Mark Paid"}
                        </Button>
                      )}

                      {(expense.status === "Pending" ||
                        expense.status === "Rejected") && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleDelete(expense.id, expense.title)
                          }
                          disabled={loadingStates[`${expense.id}_delete`]}
                        >
                          {loadingStates[`${expense.id}_delete`]
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / itemsPerPage) || 1}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={closeConfirmDialog}
          onConfirm={() => {
            confirmDialog.onConfirm();
            closeConfirmDialog();
          }}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          loading={Object.values(loadingStates).some(Boolean)}
        />
      </div>
    </div>
  );
}
