"use client";

import { ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ApexChart } from "@/app/components/charts/apex-chart";

type OrderReportSectionProps = {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
};

export function OrderReportSection({ dateRange }: OrderReportSectionProps) {
  // Mock order data - in real app, would fetch from API based on dateRange
  const orderMetrics = [
    {
      title: "Total Orders",
      value: "127",
      icon: ClipboardDocumentListIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Pending Orders",
      value: "23",
      icon: ClockIcon,
      color: "from-yellow-100 to-yellow-50",
      iconColor: "bg-yellow-500",
    },
    {
      title: "Completed Orders",
      value: "98",
      icon: CheckCircleIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Cancelled Orders",
      value: "6",
      icon: XMarkIcon,
      color: "from-red-100 to-red-50",
      iconColor: "bg-red-500",
    }
  ];

  // Mock data for charts
  const orderStatusData = [98, 23, 6]; // Completed, Pending, Cancelled
  const dailyOrdersData = Array.from({ length: 30 }, (_, i) => 
    Math.floor(Math.random() * 8) + 2
  );

  // Mock recent orders data
  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", status: "Completed", amount: 450, date: "2025-01-15", branch: "Main Branch" },
    { id: "ORD-002", customer: "Jane Smith", status: "Pending", amount: 320, date: "2025-01-15", branch: "Downtown" },
    { id: "ORD-003", customer: "Mike Johnson", status: "Ongoing", amount: 275, date: "2025-01-14", branch: "Mall Branch" },
    { id: "ORD-004", customer: "Sarah Wilson", status: "Completed", amount: 520, date: "2025-01-14", branch: "Main Branch" },
    { id: "ORD-005", customer: "Tom Brown", status: "Picked up", amount: 380, date: "2025-01-13", branch: "Downtown" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Picked up": return "text-green-600 bg-green-100";
      case "Pending":
      case "Ongoing": return "text-yellow-600 bg-yellow-100";
      case "Cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className={`bg-gradient-to-r ${metric.color} rounded-lg p-6 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
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
        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <ApexChart
            options={{
              chart: { type: "donut" },
              labels: ["Completed", "Pending", "Cancelled"],
              colors: ["#10B981", "#F59E0B", "#EF4444"],
              dataLabels: {
                enabled: true,
                formatter: (val) => `${Math.round(val as number)}%`
              },
              plotOptions: {
                pie: {
                  donut: {
                    size: "65%",
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: "Total Orders",
                        formatter: () => "127"
                      }
                    }
                  }
                }
              },
              legend: {
                position: "bottom"
              }
            }}
            series={orderStatusData}
            type="donut"
            height={300}
          />
        </div>

        {/* Daily Orders Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Orders Trend</h3>
            <span className="text-sm text-gray-500">Last 30 Days</span>
          </div>
          <ApexChart
            options={{
              chart: { type: "area", toolbar: { show: false } },
              stroke: { curve: "smooth", colors: ["#3B82F6"], width: 2 },
              fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0 } },
              dataLabels: { enabled: false },
              grid: { borderColor: "#E5E7EB" },
              xaxis: {
                categories: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
                labels: { 
                  show: false // Hide x-axis labels for cleaner look
                }
              },
              yaxis: {
                labels: {
                  formatter: (value) => Math.round(value).toString(),
                  style: { fontSize: "12px" }
                }
              }
            }}
            series={[{
              name: "Orders",
              data: dailyOrdersData
            }]}
            type="area"
            height={300}
          />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{order.branch}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₱{order.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Order Performance Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                <span className="text-lg font-bold text-green-600">77%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Orders completed successfully</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Avg. Processing Time</span>
                <span className="text-lg font-bold text-blue-600">2.5 days</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">From order to completion</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Peak Day</span>
                <span className="text-lg font-bold text-purple-600">Monday</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Highest order volume</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Cancellation Rate</span>
                <span className="text-lg font-bold text-red-600">4.7%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Orders cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}