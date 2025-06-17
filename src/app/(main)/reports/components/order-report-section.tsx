"use client";

import { useState, useEffect } from "react";
import { ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ApexChart } from "@/app/components/charts/apex-chart";
import { 
  getOrderStatusBreakdown, 
  getDailyOrderVolume, 
  getOrderPerformanceMetrics,
  getRecentOrders,
  OrderStatusBreakdown,
  DailyOrderVolume,
  OrderPerformanceMetrics,
  RecentOrder
} from "@/app/actions/order";

type OrderReportSectionProps = {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
};

export function OrderReportSection({ dateRange }: OrderReportSectionProps) {
  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusBreakdown[]>([]);
  const [dailyVolume, setDailyVolume] = useState<DailyOrderVolume[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<OrderPerformanceMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchOrderData();
  }, [dateRange]);

  const fetchOrderData = async () => {
    setLoading(true);
    try {
      const [statusResult, volumeResult, metricsResult, ordersResult] = await Promise.all([
        getOrderStatusBreakdown(dateRange.startDate, dateRange.endDate),
        getDailyOrderVolume(dateRange.startDate, dateRange.endDate),
        getOrderPerformanceMetrics(dateRange.startDate, dateRange.endDate),
        getRecentOrders(10)
      ]);

      if (statusResult.data) {
        setStatusBreakdown(statusResult.data);
        setTotalOrders(statusResult.total_orders);
      }
      if (volumeResult.data) {
        setDailyVolume(volumeResult.data);
      }
      if (metricsResult.data) {
        setPerformanceMetrics(metricsResult.data);
      }
      if (ordersResult.data) {
        setRecentOrders(ordersResult.data);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic order metrics based on real data
  const getStatusCount = (status: string) => {
    return statusBreakdown.find(s => s.status === status)?.count || 0;
  };

  const orderMetrics = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ClipboardDocumentListIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Pending Orders",
      value: getStatusCount("Pending").toString(),
      icon: ClockIcon,
      color: "from-yellow-100 to-yellow-50",
      iconColor: "bg-yellow-500",
    },
    {
      title: "Completed Orders",
      value: getStatusCount("Picked up").toString(),
      icon: CheckCircleIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Cancelled Orders",
      value: getStatusCount("Cancelled").toString(),
      icon: XMarkIcon,
      color: "from-red-100 to-red-50",
      iconColor: "bg-red-500",
    }
  ];

  // Prepare chart data
  const orderStatusData = statusBreakdown.map(status => status.count);
  const statusLabels = statusBreakdown.map(status => status.status);
  const dailyOrdersData = dailyVolume.map(day => day.order_count);

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
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-20"></div>
            </div>
          ))}
        </div>
      ) : (
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
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ApexChart
              options={{
                chart: { type: "donut" },
                labels: statusLabels,
                colors: ["#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"],
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
                          formatter: () => totalOrders.toString()
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
          )}
        </div>

        {/* Daily Orders Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Orders Trend</h3>
            <span className="text-sm text-gray-500">
              {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ApexChart
              options={{
                chart: { type: "area", toolbar: { show: false } },
                stroke: { curve: "smooth", colors: ["#3B82F6"], width: 2 },
                fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0 } },
                dataLabels: { enabled: false },
                grid: { borderColor: "#E5E7EB" },
                xaxis: {
                  categories: dailyVolume.map(day => {
                    const date = new Date(day.date);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }),
                  labels: { 
                    rotate: -45,
                    style: { fontSize: "10px" }
                  }
                },
                yaxis: {
                  labels: {
                    formatter: (value) => Math.round(value).toString(),
                    style: { fontSize: "12px" }
                  }
                },
                tooltip: {
                  custom: function({ series, seriesIndex, dataPointIndex }) {
                    const day = dailyVolume[dataPointIndex];
                    return `<div class="px-3 py-2">
                      <div class="font-semibold">${day.day_name}</div>
                      <div>${new Date(day.date).toLocaleDateString()}</div>
                      <div class="text-blue-600 font-bold">${day.order_count} orders</div>
                      <div class="text-green-600">₱${day.total_amount.toLocaleString()}</div>
                    </div>`;
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
          )}
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
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  </tr>
                ))
              ) : (
                recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{order.branch_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₱{order.total_amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                  <span className="text-lg font-bold text-green-600">
                    {performanceMetrics?.completion_rate || 0}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Orders completed successfully</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg. Processing Time</span>
                  <span className="text-lg font-bold text-blue-600">
                    {performanceMetrics?.avg_processing_time || 0} days
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">From order to completion</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Peak Day</span>
                  <span className="text-lg font-bold text-purple-600">
                    {performanceMetrics?.peak_day || "N/A"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {performanceMetrics?.peak_day_count ? `${performanceMetrics.peak_day_count} orders` : "Highest order volume"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Cancellation Rate</span>
                  <span className="text-lg font-bold text-red-600">
                    {performanceMetrics?.cancellation_rate || 0}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Orders cancelled</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}