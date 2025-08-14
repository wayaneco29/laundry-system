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
import { Plus, PlusIcon, Search } from "lucide-react";
import {
  HeaderWithButtonSkeleton,
  StatsCardsSkeleton,
  TableSkeleton,
} from "../../dashboard/components/skeleton";
import { useUserContext } from "@/app/context";

interface ExpensesMainProps {
  searchParams: {
    search?: string;
    startDate?: string;
    endDate?: string;
    branchId?: string;
    status?: string;
  };
}

export function ExpensesMain({ searchParams }: ExpensesMainProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [recurringDue, setRecurringDue] = useState<any[]>([]);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
  const [yearlyExpense, setYearlyExpense] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Array<Record<string, any>>>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Toast notifications
  const { toasts, removeToast, success, error, warning, info } = useToast();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  // Filter states
  const [filters, setFilters] = useState<{ branch_id: string }>({
    branch_id: searchParams.branchId || "",
  });

  const { is_admin, branch_id } = useUserContext();

  // Fetch all data on component mount and when filters/pagination change
  useEffect(() => {
    fetchAllData();
  }, [
    currentPage,
    itemsPerPage,
    filters.branch_id,
    searchParams.startDate,
    searchParams.endDate,
    searchParams.status,
  ]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchExpenses(),
        fetchBranches(),
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
    const result = await getAllExpenses({
      page: currentPage,
      limit: itemsPerPage,
      branchId: filters?.branch_id || branch_id,
      startDate: searchParams.startDate || undefined,
      endDate: searchParams.endDate || undefined,
    });

    if (result.data) {
      setExpenses(result.data);
      setTotalCount(result.count || 0);
    }
  };

  const fetchBranches = async () => {
    const result = await getAllBranches();
    if (result.data) {
      setBranches(result.data);
    }
  };

  const fetchMonthlyExpense = async () => {
    const branchId = filters?.branch_id || branch_id;
    const result = await getMonthlyExpense(branchId);
    if (result.data !== undefined) {
      setMonthlyExpense(result.data);
    }
  };

  const fetchYearlyExpense = async () => {
    const branchId = filters?.branch_id || branch_id;

    const result = await getYearlyExpense(branchId);
    if (result.data !== undefined) {
      setYearlyExpense(result.data);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const branchOptions = [
    { label: "All Branches", value: "" },
    ...branches.map((branch: any) => ({
      label: branch.name,
      value: branch.id,
    })),
  ];

  return (
    <div className="p-6 space-y-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Expenses</h1>
          <p className="text-slate-600">
            Manage your business expenses and track spending
          </p>
        </div>
        <Button
          leftIcon={<Plus />}
          onClick={handleCreateExpense}
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
      {is_admin && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-64">
            <Select
              label="Filter by Branch"
              options={branchOptions}
              value={filters.branch_id}
              onChange={(value: any) => {
                setFilters({
                  ...filters,
                  branch_id: value?.value,
                });
              }}
              placeholder="Select branch..."
            />
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow">
        <ExpenseTable
          data={expenses}
          totalCount={totalCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          isLoading={loading}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onEdit={handleEditExpense}
          onView={handleViewExpense}
          onShowToast={(msg, type) => success(msg)}
          onShowError={(msg) => error(msg)}
        />
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        expense={selectedExpense}
        mode={modalMode}
        onShowToast={(msg: string) => success(msg)}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
