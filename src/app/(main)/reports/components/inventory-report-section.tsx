"use client";

import { useState, useEffect } from "react";
import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ApexChart } from "@/app/components/charts/apex-chart";
import {
  getInventoryStockLevels,
  getInventoryByCategory,
  getLowStockAlerts,
  getInventoryItems,
  InventoryStockLevels,
  InventoryByCategory,
  LowStockAlert,
  InventoryItem,
} from "@/app/actions/inventory";
import { InventorySectionSkeleton } from "./skeleton";

type InventoryReportSectionProps = {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
};

export function InventoryReportSection({
  dateRange,
}: InventoryReportSectionProps) {
  const [stockLevels, setStockLevels] = useState<InventoryStockLevels | null>(
    null
  );
  const [categoryData, setCategoryData] = useState<InventoryByCategory[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, [dateRange]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [stockLevelsResult, categoryResult, alertsResult, itemsResult] =
        await Promise.all([
          getInventoryStockLevels(),
          getInventoryByCategory(),
          getLowStockAlerts(),
          getInventoryItems(undefined, 20),
        ]);
      console.log(itemsResult.data);
      if (stockLevelsResult.data) {
        setStockLevels(stockLevelsResult.data);
      }
      if (categoryResult.data) {
        setCategoryData(categoryResult.data);
      }
      if (alertsResult.data) {
        setLowStockAlerts(alertsResult.data);
      }
      if (itemsResult.data) {
        setInventoryItems(itemsResult.data);
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic inventory metrics based on real data
  const inventoryMetrics = [
    {
      title: "Total Items",
      value: stockLevels?.total_items?.toString() || "0",
      icon: ClipboardDocumentListIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Low Stock Items",
      value: (stockLevels
        ? stockLevels.low_stock + stockLevels.critical_stock
        : 0
      ).toString(),
      icon: ExclamationTriangleIcon,
      color: "from-yellow-100 to-yellow-50",
      iconColor: "bg-yellow-500",
    },
    {
      title: "In Stock",
      value: stockLevels?.in_stock?.toString() || "0",
      icon: CheckCircleIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Out of Stock",
      value: stockLevels?.out_of_stock?.toString() || "0",
      icon: XCircleIcon,
      color: "from-red-100 to-red-50",
      iconColor: "bg-red-500",
    },
  ];

  // Prepare chart data
  const stockLevelsChartData = stockLevels
    ? [
        stockLevels.in_stock,
        stockLevels.low_stock + stockLevels.critical_stock,
        stockLevels.out_of_stock,
      ]
    : [0, 0, 0];

  const categoryChartData = categoryData.map((cat) => cat.count);
  const categoryLabels = categoryData.map((cat) => cat.category);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "text-green-600 bg-green-100";
      case "Low Stock":
        return "text-yellow-600 bg-yellow-100";
      case "Critical":
        return "text-orange-600 bg-orange-100";
      case "Out of Stock":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <InventorySectionSkeleton />
      ) : (
        <>
          {/* Inventory Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventoryMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${metric.color} rounded-lg p-6 shadow-sm`}
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
            {/* Stock Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Stock Status Overview
              </h3>
              <ApexChart
                options={{
                  chart: { type: "donut" },
                  labels: ["In Stock", "Low Stock", "Out of Stock"],
                  colors: ["#10B981", "#F59E0B", "#EF4444"],
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
                            label: "Total Items",
                            formatter: () =>
                              stockLevels?.total_items?.toString() || "0",
                          },
                        },
                      },
                    },
                  },
                  legend: {
                    position: "bottom",
                  },
                }}
                series={stockLevelsChartData}
                type="donut"
                height={300}
              />
            </div>

            {/* Inventory by Category */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Items by Category
                </h3>
              </div>
              <ApexChart
                options={{
                  chart: { type: "bar", toolbar: { show: false } },
                  colors: ["#3B82F6"],
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
                      formatter: (value) => Math.round(value).toString(),
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
                    custom: function ({ series, seriesIndex, dataPointIndex }) {
                      const category = categoryLabels[dataPointIndex];
                      const itemCount = series[seriesIndex][dataPointIndex];
                      const categoryItem = categoryData[dataPointIndex];

                      return `<div class="bg-white p-3 rounded-lg shadow-lg border">
                        <div class="font-semibold text-gray-800 text-sm">${category}</div>
                        <div class="text-gray-600 text-xs mb-2">Inventory Category</div>
                        <div class="space-y-1">
                          <div class="flex items-center">
                            <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span class="text-blue-600 font-bold text-sm">${itemCount} Items</span>
                          </div>
                          <div class="flex items-center">
                            <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span class="text-green-600 text-sm">${
                              categoryItem?.total_quantity || 0
                            } Total Quantity</span>
                          </div>
                        </div>
                      </div>`;
                    },
                  },
                }}
                series={[
                  {
                    name: "Items",
                    data: categoryChartData,
                  },
                ]}
                type="bar"
                height={300}
              />
            </div>
          </div>

          {/* Inventory Items Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Inventory Items Status
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryItems.length > 0 ? (
                    inventoryItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {item.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {item.branch_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.last_updated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No inventory items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Inventory Alerts
              </h3>
            </div>
            <div className="p-6">
              {(stockLevels?.out_of_stock ?? 0) > 0 && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-sm text-red-700">
                    {stockLevels?.out_of_stock ?? 0} items are out of stock and
                    need immediate restocking
                  </span>
                </div>
              )}
              {((stockLevels?.low_stock ?? 0) > 0 ||
                (stockLevels?.critical_stock ?? 0) > 0) && (
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm text-yellow-700">
                    {(stockLevels?.low_stock || 0) +
                      (stockLevels?.critical_stock || 0)}{" "}
                    items have low stock levels and should be restocked soon
                  </span>
                </div>
              )}
              {lowStockAlerts.length > 0 && (
                <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-sm text-blue-700">
                    {lowStockAlerts.length} total items need attention. Check
                    the table above for details.
                  </span>
                </div>
              )}
              {(!stockLevels ||
                (stockLevels.out_of_stock === 0 &&
                  stockLevels.low_stock === 0 &&
                  stockLevels.critical_stock === 0)) && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-green-700">
                    All inventory items are adequately stocked
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
