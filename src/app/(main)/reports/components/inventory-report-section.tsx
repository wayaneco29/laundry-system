"use client";

import { ClipboardDocumentListIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { ApexChart } from "@/app/components/charts/apex-chart";

type InventoryReportSectionProps = {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
};

export function InventoryReportSection({ dateRange }: InventoryReportSectionProps) {
  // Mock inventory data - in real app, would fetch from API based on dateRange
  const inventoryMetrics = [
    {
      title: "Total Items",
      value: "45",
      icon: ClipboardDocumentListIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Low Stock Items",
      value: "8",
      icon: ExclamationTriangleIcon,
      color: "from-yellow-100 to-yellow-50",
      iconColor: "bg-yellow-500",
    },
    {
      title: "In Stock",
      value: "32",
      icon: CheckCircleIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Out of Stock",
      value: "5",
      icon: XCircleIcon,
      color: "from-red-100 to-red-50",
      iconColor: "bg-red-500",
    }
  ];

  // Mock data for charts
  const stockLevelsData = [32, 8, 5]; // In Stock, Low Stock, Out of Stock
  const categoryData = [15, 12, 10, 8]; // Detergents, Fabric Softeners, Bleach, Others

  // Mock inventory items data
  const inventoryItems = [
    { name: "Heavy Duty Detergent", category: "Detergents", stock: 45, status: "In Stock", lastRestocked: "2025-01-10" },
    { name: "Fabric Softener", category: "Softeners", stock: 12, status: "Low Stock", lastRestocked: "2025-01-08" },
    { name: "Bleach Powder", category: "Bleach", stock: 0, status: "Out of Stock", lastRestocked: "2024-12-28" },
    { name: "Stain Remover", category: "Cleaners", stock: 25, status: "In Stock", lastRestocked: "2025-01-12" },
    { name: "Enzyme Detergent", category: "Detergents", stock: 8, status: "Low Stock", lastRestocked: "2025-01-05" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "text-green-600 bg-green-100";
      case "Low Stock": return "text-yellow-600 bg-yellow-100";
      case "Out of Stock": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Inventory Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventoryMetrics.map((metric, index) => {
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
        {/* Stock Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status Overview</h3>
          <ApexChart
            options={{
              chart: { type: "donut" },
              labels: ["In Stock", "Low Stock", "Out of Stock"],
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
                        label: "Total Items",
                        formatter: () => "45"
                      }
                    }
                  }
                }
              },
              legend: {
                position: "bottom"
              }
            }}
            series={stockLevelsData}
            type="donut"
            height={300}
          />
        </div>

        {/* Inventory by Category */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Items by Category</h3>
          </div>
          <ApexChart
            options={{
              chart: { type: "bar", toolbar: { show: false } },
              colors: ["#3B82F6"],
              dataLabels: { enabled: false },
              grid: { borderColor: "#E5E7EB" },
              xaxis: {
                categories: ["Detergents", "Softeners", "Bleach", "Others"],
                labels: { style: { fontSize: "12px" } }
              },
              yaxis: {
                labels: {
                  formatter: (value) => Math.round(value).toString(),
                  style: { fontSize: "12px" }
                }
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  horizontal: false
                }
              }
            }}
            series={[{
              name: "Items",
              data: categoryData
            }]}
            type="bar"
            height={300}
          />
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Items Status</h3>
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
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Restocked
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.lastRestocked).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-sm text-red-700">5 items are out of stock and need immediate restocking</span>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
              <span className="text-sm text-yellow-700">8 items have low stock levels and should be restocked soon</span>
            </div>
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500 mr-3" />
              <span className="text-sm text-blue-700">Next scheduled inventory check: January 20, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}