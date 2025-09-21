"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import {
  MonthlySalesData,
  MonthlySalesChartData,
  getMonthSales,
  getMonthlyCustomers,
  getMonthlySalesChart,
  getTodayCustomers,
} from "@/app/actions";
import { ApexChart } from "@/app/components/charts/apex-chart";
import { SalesReportSection } from "./sales-report-section";
import { CustomerReportSection } from "./customer-report-section";
import { InventoryReportSection } from "./inventory-report-section";
import { OrderReportSection } from "./order-report-section";
import { ExpenseReportSection } from "./expense-report-section";
import { DateFilterSection } from "./date-filter-section";
import { ExportModal } from "./export-modal";
import { ExportData } from "@/app/utils/export-utils";
import { getOrders } from "@/app/actions/order";
import { getAllCustomers } from "@/app/actions/customer";
import { getAllExpenses } from "@/app/actions/expense";
import { SalesSectionSkeleton } from "./skeleton";
import { Button } from "@/app/components/common";

type MainReportsPageProps = {
  monthlySalesData: MonthlySalesData | null;
  chartData: MonthlySalesChartData | null;
  monthlyCustomersCount: number;
  todayCustomersCount: number;
};

export function MainReportsPage({
  monthlySalesData,
  chartData,
  monthlyCustomersCount,
  todayCustomersCount,
}: MainReportsPageProps) {
  const [initialMonthlySalesData, setInitialMonthlySalesData] =
    useState<MonthlySalesData | null>(monthlySalesData);
  const [initialChartData, setInitialChartData] =
    useState<MonthlySalesChartData | null>(chartData);
  const [initialMonthlyCustomerCount, setInitialMonthlyCustomerCount] =
    useState<number>(monthlyCustomersCount);
  const [initialTodayCustomersCount, setInitialTodayCustomersCount] =
    useState<number>(todayCustomersCount);
  const [activeTab, setActiveTab] = useState<
    "overview" | "sales" | "customers" | "inventory" | "orders" | "expenses"
  >("overview");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
  });
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportData, setExportData] = useState<ExportData>({});
  const [isLoadingExport, setIsLoadingExport] = useState(false);

  const tabs = [
    { id: "overview", name: "Overview", icon: ChartBarIcon },
    { id: "sales", name: "Sales Analytics", icon: CurrencyDollarIcon },
    { id: "customers", name: "Customer Analytics", icon: UsersIcon },
    {
      id: "inventory",
      name: "Inventory Reports",
      icon: ClipboardDocumentListIcon,
    },
    { id: "orders", name: "Order Reports", icon: DocumentArrowDownIcon },
    { id: "expenses", name: "Expense Reports", icon: BanknotesIcon },
  ];

  const handleExportReport = async () => {
    setIsLoadingExport(true);
    try {
      // Fetch data based on active tab and date range
      const data: ExportData = {
        dateRange: dateRange,
        sales: monthlySalesData,
      };

      // Fetch orders data
      const ordersResponse = await getOrders();
      if (ordersResponse.data) {
        // Filter orders by date range
        const filteredOrders = ordersResponse.data.filter((order: any) => {
          const orderDate = new Date(order.order_date);
          return (
            orderDate >= dateRange.startDate && orderDate <= dateRange.endDate
          );
        });
        data.orders = filteredOrders;
      }

      // Fetch customers data
      const customersResponse = await getAllCustomers();
      if (customersResponse.data) {
        // Filter customers by date range
        const filteredCustomers = customersResponse.data.filter(
          (customer: any) => {
            const customerDate = new Date(customer.created_at);
            return (
              customerDate >= dateRange.startDate &&
              customerDate <= dateRange.endDate
            );
          }
        );
        data.customers = filteredCustomers;
      }

      // Fetch expenses data
      const expensesResponse = await getAllExpenses();
      if (expensesResponse.data) {
        // Filter expenses by date range
        const filteredExpenses = expensesResponse.data.filter(
          (expense: any) => {
            const expenseDate = new Date(expense.expense_date);
            return (
              expenseDate >= dateRange.startDate &&
              expenseDate <= dateRange.endDate
            );
          }
        );
        data.expenses = filteredExpenses;
      }

      setExportData(data);
      setExportModalOpen(true);
    } catch (error) {
      console.error("Failed to prepare export data:", error);
      alert("Failed to prepare export data. Please try again.");
    } finally {
      setIsLoadingExport(false);
    }
  };

  // Add a loading state for overview
  const isOverviewLoading = !monthlySalesData || !chartData;

  const [isLoading, setIsLoading] = useState<boolean>(isOverviewLoading);

  useEffect(() => {
    const getReportsData = async (dateRange: any) => {
      setIsLoading(true);
      const [
        xMonthlySalesData,
        xChartData,
        xMonthlyCustomersCount,
        xTodayCustomersCount,
      ] = await Promise.all([
        getMonthSales(undefined, dateRange?.startDate, dateRange?.endDate),
        getMonthlySalesChart(
          undefined,
          dateRange?.startDate,
          dateRange?.endDate
        ),
        getMonthlyCustomers(
          undefined,
          dateRange?.startDate,
          dateRange?.endDate
        ),
        getTodayCustomers(undefined),
      ]);

      console.log(xMonthlySalesData?.data);
      setInitialMonthlySalesData(xMonthlySalesData?.data);
      setInitialChartData(xChartData?.data);
      setInitialMonthlyCustomerCount(xMonthlyCustomersCount?.count);
      setInitialTodayCustomersCount(xTodayCustomersCount?.count);

      setIsLoading(false);
    };

    getReportsData(dateRange);
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Analytics & Reports
          </h1>
          <p className="text-slate-600">
            Comprehensive insights into your laundry business performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
            onClick={handleExportReport}
            disabled={isLoadingExport}
            className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingExport ? "Preparing..." : "Export Report"}
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilterSection
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Sections */}
      <div className="flex-1">
        {activeTab === "overview" &&
          (isLoading ? (
            <SalesSectionSkeleton />
          ) : (
            <OverviewSection
              monthlySalesData={initialMonthlySalesData}
              chartData={initialChartData}
              monthlyCustomersCount={initialMonthlyCustomerCount}
              todayCustomersCount={initialTodayCustomersCount}
            />
          ))}

        {activeTab === "sales" && (
          <SalesReportSection
            monthlySalesData={monthlySalesData}
            chartData={chartData}
            dateRange={dateRange}
          />
        )}

        {activeTab === "customers" && (
          <CustomerReportSection
            monthlyCustomersCount={monthlyCustomersCount}
            todayCustomersCount={todayCustomersCount}
            dateRange={dateRange}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryReportSection dateRange={dateRange} />
        )}

        {activeTab === "orders" && <OrderReportSection dateRange={dateRange} />}

        {activeTab === "expenses" && (
          <ExpenseReportSection dateRange={dateRange} />
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={exportData}
        activeTab={activeTab}
      />
    </div>
  );
}

// Overview Section Component
function OverviewSection({
  monthlySalesData,
  chartData,
  monthlyCustomersCount,
  todayCustomersCount,
}: {
  monthlySalesData: MonthlySalesData | null;
  chartData: MonthlySalesChartData | null;
  monthlyCustomersCount: number;
  todayCustomersCount: number;
}) {
  const summaryCards = [
    {
      title: "Total Revenue (This Month)",
      value: `₱${monthlySalesData?.totalSales?.toLocaleString() || "0"}`,
      icon: CurrencyDollarIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Paid Sales (This Month)",
      value: `₱${monthlySalesData?.paidSales?.toLocaleString() || "0"}`,
      icon: CurrencyDollarIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Monthly Customers",
      value: monthlyCustomersCount.toString(),
      icon: UsersIcon,
      color: "from-purple-100 to-purple-50",
      iconColor: "bg-purple-500",
    },
    {
      title: "Today's Customers",
      value: todayCustomersCount.toString(),
      icon: UsersIcon,
      color: "from-orange-100 to-orange-50",
      iconColor: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-r ${card.color} rounded-lg p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.iconColor} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Sales Overview
            </h3>
            <span className="text-sm text-gray-500">This Year</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-4">
            ₱{chartData?.totalYearSales?.toLocaleString() || "0"}
          </div>
          <ApexChart
            options={{
              chart: { type: "area", toolbar: { show: false } },
              stroke: { curve: "smooth", colors: ["#3B82F6"], width: 2 },
              fill: {
                type: "gradient",
                gradient: { opacityFrom: 0.3, opacityTo: 0 },
              },
              dataLabels: { enabled: false },
              grid: { borderColor: "#E5E7EB" },
              xaxis: {
                categories: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
                labels: { style: { fontSize: "12px" } },
              },
              yaxis: {
                labels: {
                  formatter: (value) =>
                    `₱${value}${chartData?.useThousands ? "k" : ""}`,
                  style: { fontSize: "12px" },
                },
              },
              tooltip: {
                custom: function ({ series, seriesIndex, dataPointIndex }) {
                  const months = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ];
                  const monthName = months[dataPointIndex];
                  const value = series[seriesIndex][dataPointIndex];
                  const formattedValue = chartData?.useThousands
                    ? `₱${value}k`
                    : `₱${value?.toLocaleString() || 0}`;

                  // Calculate percentage of yearly total
                  const yearlyTotal = chartData?.totalYearSales || 0;
                  const percentage =
                    yearlyTotal > 0
                      ? Math.round((value / yearlyTotal) * 100)
                      : 0;

                  return `<div class="bg-white p-3 rounded-lg shadow-lg border">
                    <div class="font-semibold text-gray-800 text-sm">${monthName} ${new Date().getFullYear()}</div>
                    <div class="text-gray-600 text-xs mb-2">Monthly Sales</div>
                    <div class="space-y-1">
                      <div class="flex items-center">
                        <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span class="text-blue-600 font-bold text-sm">${formattedValue}</span>
                      </div>
                      <div class="flex items-center">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span class="text-green-600 text-sm">${percentage}% of yearly total</span>
                      </div>
                    </div>
                  </div>`;
                },
              },
            }}
            series={[
              {
                name: "Sales",
                data: chartData?.monthlyData || Array(12).fill(0),
              },
            ]}
            type="area"
            height={300}
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Unpaid Sales
              </span>
              <span className="text-lg font-bold text-red-600">
                ₱{monthlySalesData?.unpaidSales?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Collection Rate
              </span>
              <span className="text-lg font-bold text-green-600">
                {monthlySalesData?.totalSales
                  ? Math.round(
                      (monthlySalesData.paidSales /
                        monthlySalesData.totalSales) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Avg. Customer Value
              </span>
              <span className="text-lg font-bold text-blue-600">
                ₱
                {monthlyCustomersCount > 0
                  ? Math.round(
                      (monthlySalesData?.totalSales || 0) /
                        monthlyCustomersCount
                    ).toLocaleString()
                  : "0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
