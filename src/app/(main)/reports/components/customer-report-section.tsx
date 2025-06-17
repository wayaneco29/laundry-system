"use client";

import { useState, useEffect } from "react";
import { UsersIcon, UserPlusIcon, ClockIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { ApexChart } from "@/app/components/charts/apex-chart";
import { getDailyCustomerTraffic, DailyCustomerTraffic } from "@/app/actions/customer";

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
  todayCustomersCount,
  dateRange 
}: CustomerReportSectionProps) {
  const [dailyTraffic, setDailyTraffic] = useState<DailyCustomerTraffic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyTraffic();
  }, [dateRange]);

  const fetchDailyTraffic = async () => {
    setLoading(true);
    try {
      const result = await getDailyCustomerTraffic(dateRange.startDate, dateRange.endDate);
      if (result.data) {
        setDailyTraffic(result.data);
      }
    } catch (error) {
      console.error('Error fetching daily traffic:', error);
    } finally {
      setLoading(false);
    }
  };
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
      value: dailyTraffic.length > 0 
        ? Math.round(dailyTraffic.reduce((sum, day) => sum + day.customer_count, 0) / dailyTraffic.length).toString()
        : "0",
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

  // Get peak day info
  const peakDay = dailyTraffic.length > 0 
    ? dailyTraffic.reduce((max, day) => day.customer_count > max.customer_count ? day : max, dailyTraffic[0])
    : null;

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
                chart: { type: "bar", toolbar: { show: false } },
                colors: ["#3B82F6"],
                dataLabels: { enabled: false },
                grid: { borderColor: "#E5E7EB" },
                xaxis: {
                  categories: dailyTraffic.map(day => {
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
                plotOptions: {
                  bar: {
                    borderRadius: 4,
                    columnWidth: "80%"
                  }
                },
                tooltip: {
                  custom: function({ series, seriesIndex, dataPointIndex }) {
                    const day = dailyTraffic[dataPointIndex];
                    return `<div class="px-3 py-2">
                      <div class="font-semibold">${day.day_name}</div>
                      <div>${new Date(day.date).toLocaleDateString()}</div>
                      <div class="text-blue-600 font-bold">${day.customer_count} customers</div>
                    </div>`;
                  }
                }
              }}
              series={[{
                name: "Customers",
                data: dailyTraffic.map(day => day.customer_count)
              }]}
              type="bar"
              height={300}
            />
          )}
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
                <span className="text-lg font-bold text-gray-900">
                  {peakDay ? peakDay.day_name : "No data"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {peakDay ? `${peakDay.customer_count} customers on ${new Date(peakDay.date).toLocaleDateString()}` : "Highest customer traffic"}
              </p>
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