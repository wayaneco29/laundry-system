"use client";

import { useState, useEffect } from "react";
import { Button, Select, ToastContainer } from "@/app/components/common";
import { ExpenseTable } from "./expense-table";
import { ExpenseModal } from "./expense-modal";
import {
  getAllExpenses,
  getExpenseStats,
  getExpensesByCategory,
  getRecurringExpensesDue,
} from "@/app/actions/expense";
import { getAllBranches } from "@/app/actions/branch";
import { useToast } from "@/app/hooks/use-toast";
import { PlusIcon } from "lucide-react";

export function ExpensesMain() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [recurringDue, setRecurringDue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast notifications
  const { toasts, removeToast, success, error, warning, info } = useToast();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  // Filter states
  const [filters, setFilters] = useState({
    branch_id: "",
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Apply filters when expenses or filters change
  useEffect(() => {
    applyFilters();
  }, [expenses, filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchExpenses(),
        fetchBranches(),
        fetchStats(),
        fetchCategoryStats(),
        fetchRecurringDue(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    const result = await getAllExpenses();
    if (result.data) {
      setExpenses(result.data);
    }
  };

  const fetchBranches = async () => {
    const result = await getAllBranches();
    if (result.data) {
      setBranches(result.data);
    }
  };

  const fetchStats = async () => {
    const result = await getExpenseStats();
    if (result.data) {
      setStats(result.data);
    }
  };

  const fetchCategoryStats = async () => {
    const result = await getExpensesByCategory();
    if (result.data) {
      setCategoryStats(result.data);
    }
  };

  const fetchRecurringDue = async () => {
    const result = await getRecurringExpensesDue(30); // Next 30 days
    if (result.data) {
      setRecurringDue(result.data);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Branch filter
    if (filters.branch_id) {
      const branchValue =
        typeof filters.branch_id === "object"
          ? filters.branch_id.value
          : filters.branch_id;
      if (branchValue && branchValue !== "") {
        filtered = filtered.filter(
          (expense) => expense.branch_id === branchValue
        );
      }
    }

    setFilteredExpenses(filtered);
  };

  const handleFilterChange = (field: string, value: any) => {
    // Extract value if it's an object from Select component
    const actualValue =
      typeof value === "object" && value?.value !== undefined
        ? value.value
        : value;
    setFilters((prev) => ({ ...prev, [field]: actualValue }));
  };

  const clearFilters = () => {
    setFilters({
      branch_id: "",
    });
  };

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedExpense(null);
    // Refresh data after modal closes
    setTimeout(() => {
      fetchAllData();
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const branchOptions = [
    { label: "All Branches", value: "" },
    ...branches.map((branch) => ({
      label: branch.name,
      value: branch.id,
    })),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">
            Manage your business expenses and track spending
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<PlusIcon />}
          onClick={handleCreateExpense}
        >
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_expenses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(Number(stats.total_amount))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending_expenses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(Number(stats.avg_expense_amount))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Expenses Due Alert */}
      {recurringDue.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-orange-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-sm font-medium text-orange-800">
              {recurringDue.length} recurring expense
              {recurringDue.length > 1 ? "s" : ""} due soon
            </h3>
          </div>
          <div className="mt-2 text-sm text-orange-700">
            {recurringDue.slice(0, 3).map((expense, index) => (
              <div key={expense.expense_id}>
                • {expense.title} - {formatCurrency(Number(expense.amount))}{" "}
                (Due: {new Date(expense.next_due_date).toLocaleDateString()})
              </div>
            ))}
            {recurringDue.length > 3 && (
              <div className="text-orange-600 font-medium">
                ... and {recurringDue.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="w-64">
          <Select
            label="Filter by Branch"
            options={branchOptions}
            value={filters.branch_id}
            onChange={(value) => handleFilterChange("branch_id", value)}
            placeholder="Select branch..."
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredExpenses.length} of {expenses.length} expenses
        </p>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow">
        <ExpenseTable
          data={filteredExpenses}
          onEdit={handleEditExpense}
          onView={handleViewExpense}
          onShowToast={success}
          onShowError={error}
        />
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        expense={selectedExpense}
        mode={modalMode}
        onShowToast={success}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
