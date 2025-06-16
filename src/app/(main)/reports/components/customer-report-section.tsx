"use client";

import { UsersIcon, UserPlusIcon, ClockIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { ApexChart } from "@/app/components/charts/apex-chart";

type CustomerReportSectionProps = {
  monthlyCustomersCount: number;
  todayCustomersCount: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
};

export function CustomerReportSection({ 
  monthlyCustomersCount, 
  todayCustomersCount 
}: CustomerReportSectionProps) {
  const customerMetrics = [
    {
      title: "Total Customers (Month)",
      value: monthlyCustomersCount.toString(),
      icon: UsersIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Today's Customers",
      value: todayCustomersCount.toString(),
      icon: UserPlusIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Daily Average",
      value: Math.round(monthlyCustomersCount / new Date().getDate()).toString(),
      icon: ClockIcon,
      color: "from-purple-100 to-purple-50",
      iconColor: "bg-purple-500",
    },
    {
      title: "Growth Rate",
      value: "+12%", // Mock data - would need historical comparison
      icon: ArrowTrendingUpIcon,
      color: "from-orange-100 to-orange-50",
      iconColor: "bg-orange-500",
    }
  ];

  // Mock data for customer charts - in real app, would fetch from API
  const dailyCustomersData = Array.from({ length: 30 }, () => 
    Math.floor(Math.random() * 10) + 5
  );

  const customerTypeData = [65, 35]; // Returning vs New customers

  return (
    <div className="space-y-6">
      {/* Customer Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customerMetrics.map((metric, index) => {
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
        {/* Daily Customer Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Customer Traffic</h3>
            <span className="text-sm text-gray-500">Last 30 Days</span>
          </div>
          <ApexChart
            options={{
              chart: { type: "bar", toolbar: { show: false } },
              colors: ["#3B82F6"],
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
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  columnWidth: "80%"
                }
              }
            }}
            series={[{
              name: "Customers",
              data: dailyCustomersData
            }]}
            type="bar"
            height={300}
          />
        </div>

        {/* Customer Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Type Distribution</h3>
          <ApexChart
            options={{
              chart: { type: "donut" },
              labels: ["Returning Customers", "New Customers"],
              colors: ["#10B981", "#3B82F6"],
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
                        label: "Total",
                        formatter: () => monthlyCustomersCount.toString()
                      }
                    }
                  }
                }
              },
              legend: {
                position: "bottom"
              }
            }}
            series={customerTypeData}
            type="donut"
            height={300}
          />
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Peak Day</span>
                <span className="text-lg font-bold text-gray-900">Saturday</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Highest customer traffic</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Retention Rate</span>
                <span className="text-lg font-bold text-green-600">65%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Customers returning monthly</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Avg. Visit Frequency</span>
                <span className="text-lg font-bold text-blue-600">2.3x</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Times per month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}