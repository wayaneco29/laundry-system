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
  getMonthlyExpense,
  getYearlyExpense,
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
  const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
  const [yearlyExpense, setYearlyExpense] = useState<number>(0);
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

  // Refetch expense data when branch filter changes
  useEffect(() => {
    if (branches.length > 0) {
      fetchMonthlyExpense();
      fetchYearlyExpense();
    }
  }, [filters.branch_id]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchExpenses(),
        fetchBranches(),
        fetchStats(),
        fetchCategoryStats(),
        fetchRecurringDue(),
        fetchMonthlyExpense(),
        fetchYearlyExpense(),
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

  const fetchMonthlyExpense = async () => {
    const branchId = filters.branch_id || undefined;
    const result = await getMonthlyExpense(branchId);
    if (result.data !== undefined) {
      setMonthlyExpense(result.data);
    }
  };

  const fetchYearlyExpense = async () => {
    const branchId = filters.branch_id || undefined;
    const result = await getYearlyExpense(branchId);
    if (result.data !== undefined) {
      setYearlyExpense(result.data);
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

      {/* Expense Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                This Month Expenses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyExpense)}
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Yearly Expenses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(yearlyExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

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
