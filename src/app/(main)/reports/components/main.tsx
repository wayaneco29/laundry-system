"use client";

import { useState } from "react";
import { 
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { MonthlySalesData, MonthlySalesChartData } from "@/app/actions";
import { ApexChart } from "@/app/components/charts/apex-chart";
import { SalesReportSection } from "./sales-report-section";
import { CustomerReportSection } from "./customer-report-section";
import { InventoryReportSection } from "./inventory-report-section";
import { OrderReportSection } from "./order-report-section";
import { DateFilterSection } from "./date-filter-section";

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
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customers' | 'inventory' | 'orders'>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'sales', name: 'Sales Analytics', icon: CurrencyDollarIcon },
    { id: 'customers', name: 'Customer Analytics', icon: UsersIcon },
    { id: 'inventory', name: 'Inventory Reports', icon: ClipboardDocumentListIcon },
    { id: 'orders', name: 'Order Reports', icon: DocumentArrowDownIcon },
  ];

  const handleExportReport = () => {
    // Export functionality - could generate PDF, CSV, etc.
    alert('Export functionality would be implemented here');
  };

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
          <button className="inline-flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <FunnelIcon className="h-4 w-4" />
            Filters
          </button>
          <button 
            onClick={handleExportReport}
            className="inline-flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export Report
          </button>
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
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        {activeTab === 'overview' && (
          <OverviewSection
            monthlySalesData={monthlySalesData}
            chartData={chartData}
            monthlyCustomersCount={monthlyCustomersCount}
            todayCustomersCount={todayCustomersCount}
          />
        )}
        
        {activeTab === 'sales' && (
          <SalesReportSection 
            monthlySalesData={monthlySalesData}
            chartData={chartData}
            dateRange={dateRange}
          />
        )}
        
        {activeTab === 'customers' && (
          <CustomerReportSection 
            monthlyCustomersCount={monthlyCustomersCount}
            todayCustomersCount={todayCustomersCount}
            dateRange={dateRange}
          />
        )}
        
        {activeTab === 'inventory' && (
          <InventoryReportSection dateRange={dateRange} />
        )}
        
        {activeTab === 'orders' && (
          <OrderReportSection dateRange={dateRange} />
        )}
      </div>
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
            <div key={index} className={`bg-gradient-to-r ${card.color} rounded-lg p-6 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
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
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <span className="text-sm text-gray-500">This Year</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-4">
            ₱{chartData?.totalYearSales?.toLocaleString() || "0"}
          </div>
          <ApexChart
            options={{
              chart: { type: "area", toolbar: { show: false } },
              stroke: { curve: "smooth", colors: ["#3B82F6"], width: 2 },
              fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0 } },
              dataLabels: { enabled: false },
              grid: { borderColor: "#E5E7EB" },
              xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                labels: { style: { fontSize: "12px" } }
              },
              yaxis: {
                labels: {
                  formatter: (value) => `₱${value}${chartData?.useThousands ? 'k' : ''}`,
                  style: { fontSize: "12px" }
                }
              }
            }}
            series={[{
              name: "Sales",
              data: chartData?.monthlyData || Array(12).fill(0)
            }]}
            type="area"
            height={300}
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Unpaid Sales</span>
              <span className="text-lg font-bold text-red-600">
                ₱{monthlySalesData?.unpaidSales?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Collection Rate</span>
              <span className="text-lg font-bold text-green-600">
                {monthlySalesData?.totalSales 
                  ? Math.round((monthlySalesData.paidSales / monthlySalesData.totalSales) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Avg. Customer Value</span>
              <span className="text-lg font-bold text-blue-600">
                ₱{monthlyCustomersCount > 0 
                  ? Math.round((monthlySalesData?.totalSales || 0) / monthlyCustomersCount).toLocaleString()
                  : "0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}