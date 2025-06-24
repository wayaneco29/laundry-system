"use client";

import { useState, useEffect } from "react";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ApexChart } from "@/app/components/charts/apex-chart";
import {
  getExpenseStats,
  getExpensesByCategory,
  getMonthlyExpense,
  getYearlyExpense,
  getAllExpenses,
} from "@/app/actions/expense";
import { ExpensesSectionSkeleton } from "./skeleton";

type ExpenseReportSectionProps = {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
};

type ExpenseStats = {
  total_expenses: number;
  approved_expenses: number;
  pending_expenses: number;
  paid_expenses: number;
  unpaid_expenses: number;
};

type ExpenseCategory = {
  category_name: string;
  total_amount: number;
  expense_count: number;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  status: string;
  approval_status: string;
  branch_name: string;
  created_at: string;
};

export function ExpenseReportSection({ dateRange }: ExpenseReportSectionProps) {
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [categoryData, setCategoryData] = useState<ExpenseCategory[]>([]);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
  const [yearlyExpense, setYearlyExpense] = useState<number>(0);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseData();
  }, [dateRange]);

  const fetchExpenseData = async () => {
    setLoading(true);
    try {
      const [
        statsResult,
        categoryResult,
        monthlyResult,
        yearlyResult,
        expensesResult,
      ] = await Promise.all([
        getExpenseStats(),
        getExpensesByCategory({
          startDate: dateRange.startDate.toISOString().split("T")[0],
          endDate: dateRange.endDate.toISOString().split("T")[0],
        }),
        getMonthlyExpense(),
        getYearlyExpense(),
        getAllExpenses({
          startDate: dateRange.startDate.toISOString().split("T")[0],
          endDate: dateRange.endDate.toISOString().split("T")[0],
        }),
      ]);

      if (statsResult.data) setExpenseStats(statsResult.data);
      if (categoryResult.data && Array.isArray(categoryResult.data)) {
        setCategoryData(categoryResult.data);
      }
      setMonthlyExpense(monthlyResult.data || 0);
      setYearlyExpense(yearlyResult.data || 0);
      if (expensesResult.data && Array.isArray(expensesResult.data)) {
        // Get recent expenses (already filtered by date range) and ensure they have required fields
        const validExpenses = expensesResult.data
          .filter((expense: any) => expense && typeof expense === "object")
          .slice(0, 10);
        setRecentExpenses(validExpenses);
      }
    } catch (error) {
      console.error("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const expenseMetrics = [
    {
      title: "Total Expenses",
      value: `₱${expenseStats?.total_expenses?.toLocaleString() || "0"}`,
      icon: BanknotesIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Approved Expenses",
      value: `₱${expenseStats?.approved_expenses?.toLocaleString() || "0"}`,
      icon: ArrowTrendingUpIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Pending Expenses",
      value: `₱${expenseStats?.pending_expenses?.toLocaleString() || "0"}`,
      icon: ExclamationTriangleIcon,
      color: "from-yellow-100 to-yellow-50",
      iconColor: "bg-yellow-500",
    },
    {
      title: "Monthly Expense",
      value: `₱${monthlyExpense?.toLocaleString() || "0"}`,
      icon: CalendarIcon,
      color: "from-purple-100 to-purple-50",
      iconColor: "bg-purple-500",
    },
  ];

  // Prepare chart data with safe handling
  const categoryChartData = categoryData.map((cat) =>
    Number(cat?.total_amount || 0)
  );
  const categoryLabels = categoryData.map(
    (cat) => cat?.category_name || "Unknown"
  );

  const getStatusColor = (status: string | undefined | null) => {
    const normalizedStatus = (status || "unknown").toString().toLowerCase();
    switch (normalizedStatus) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "paid":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <ExpensesSectionSkeleton />
      ) : (
        <>
          {/* Expense Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expenseMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${
                    metric.color
                  } rounded-lg p-6 shadow-sm ${loading ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {metric.value}
                      </p>
                    </div>
                    <div className={`${metric.iconColor} p-3 rounded-full`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Expenses by Category */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Expenses by Category
                </h3>
                <span className="text-sm text-gray-500">Date Range</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ApexChart
                  options={{
                    chart: { type: "bar", toolbar: { show: false } },
                    colors: ["#EF4444"],
                    dataLabels: { enabled: false },
                    grid: { borderColor: "#E5E7EB" },
                    xaxis: {
                      categories: categoryLabels,
                      labels: {
                        style: { fontSize: "10px" },
                        rotate: -45,
                      },
                    },
                    yaxis: {
                      labels: {
                        formatter: (value) =>
                          `₱${value?.toLocaleString() || 0}`,
                        style: { fontSize: "12px" },
                      },
                    },
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        horizontal: false,
                      },
                    },
                    tooltip: {
                      custom: function ({
                        series,
                        seriesIndex,
                        dataPointIndex,
                      }) {
                        const category = categoryLabels[dataPointIndex];
                        const amount = series[seriesIndex][dataPointIndex];
                        const categoryItem = categoryData[dataPointIndex];

                        return `<div class="bg-white p-3 rounded-lg shadow-lg border">
                          <div class="font-semibold text-gray-800 text-sm">${category}</div>
                          <div class="text-gray-600 text-xs mb-2">Expense Category</div>
                          <div class="space-y-1">
                            <div class="flex items-center">
                              <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                              <span class="text-red-600 font-bold text-sm">₱${
                                amount?.toLocaleString() || 0
                              }</span>
                            </div>
                            <div class="flex items-center">
                              <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <span class="text-blue-600 text-sm">${
                                categoryItem?.expense_count || 0
                              } Expenses</span>
                            </div>
                          </div>
                        </div>`;
                      },
                    },
                  }}
                  series={[
                    {
                      name: "Amount",
                      data: categoryChartData,
                    },
                  ]}
                  type="bar"
                  height={300}
                />
              )}
            </div>

            {/* Expense Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Expense Status Breakdown
              </h3>
              {loading ? (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ApexChart
                  options={{
                    chart: { type: "donut" },
                    labels: ["Approved", "Pending", "Paid"],
                    colors: ["#10B981", "#F59E0B", "#3B82F6"],
                    dataLabels: {
                      enabled: true,
                      formatter: (val) => `${Math.round(val as number)}%`,
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: "65%",
                          labels: {
                            show: true,
                            total: {
                              show: true,
                              label: "Total Expenses",
                              formatter: () =>
                                `₱${
                                  expenseStats?.total_expenses?.toLocaleString() ||
                                  "0"
                                }`,
                            },
                          },
                        },
                      },
                    },
                    legend: {
                      position: "bottom",
                    },
                  }}
                  series={[
                    expenseStats?.approved_expenses || 0,
                    expenseStats?.pending_expenses || 0,
                    expenseStats?.paid_expenses || 0,
                  ]}
                  type="donut"
                  height={300}
                />
              )}
            </div>
          </div>

          {/* Recent Expenses Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Expenses
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                      </tr>
                    ))
                  ) : recentExpenses.length > 0 ? (
                    recentExpenses.map((expense, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.description || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {expense.category || "Uncategorized"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₱{Number(expense.amount || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              expense.status
                            )}`}
                          >
                            {expense.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {expense.branch_name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.created_at
                            ? new Date(expense.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No expenses found for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Summary */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Expense Summary
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Monthly Average
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₱
                      {monthlyExpense > 0
                        ? Math.round(monthlyExpense).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Yearly Total
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₱{yearlyExpense?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Approval Rate
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {expenseStats?.total_expenses &&
                      expenseStats?.approved_expenses
                        ? Math.round(
                            (expenseStats.approved_expenses /
                              expenseStats.total_expenses) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
