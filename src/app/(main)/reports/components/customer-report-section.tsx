"use client";

import { useState, useEffect } from "react";
import {
  UsersIcon,
  UserPlusIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { ApexChart } from "@/app/components/charts/apex-chart";
import {
  getDailyCustomerTraffic,
  getCustomerRetentionMetrics,
  getCustomerLifetimeValue,
  getCustomerDemographics,
  getCustomerBehavior,
  getTopCustomers,
  DailyCustomerTraffic,
  CustomerRetentionMetrics,
  CustomerLifetimeValue,
  CustomerDemographics,
  CustomerBehavior,
  TopCustomer,
} from "@/app/actions/customer";
import { getMonthlyCustomers } from "@/app/actions";
import { CustomersSectionSkeleton } from "./skeleton";

type CustomerReportSectionProps = {
  monthlyCustomersCount: number;
  todayCustomersCount: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  branchId?: string;
};

// Helper to check if date range is 'This Year'
function isFullYearRange(startDate: Date, endDate: Date) {
  const now = new Date();
  return (
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === 0 &&
    startDate.getDate() === 1 &&
    ((endDate.getMonth() === 11 && endDate.getDate() === 31) ||
      (endDate.getFullYear() === now.getFullYear() &&
        endDate.getMonth() === now.getMonth() &&
        endDate.getDate() === now.getDate()))
  );
}

export function CustomerReportSection({
  monthlyCustomersCount: initialMonthlyCustomersCount,
  todayCustomersCount: initialTodayCustomersCount,
  dateRange,
  branchId,
}: CustomerReportSectionProps) {
  const [monthlyCustomersCount, setMonthlyCustomersCount] = useState(
    initialMonthlyCustomersCount
  );
  const [todayCustomersCount, setTodayCustomersCount] = useState(
    initialTodayCustomersCount
  );
  const [dailyTraffic, setDailyTraffic] = useState<DailyCustomerTraffic[]>([]);
  const [retentionMetrics, setRetentionMetrics] =
    useState<CustomerRetentionMetrics | null>(null);
  const [lifetimeValue, setLifetimeValue] =
    useState<CustomerLifetimeValue | null>(null);
  const [demographics, setDemographics] = useState<CustomerDemographics | null>(
    null
  );
  const [behavior, setBehavior] = useState<CustomerBehavior | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerAnalytics();
  }, [dateRange, branchId]);

  const fetchCustomerAnalytics = async () => {
    setLoading(true);
    try {
      const [
        trafficResult,
        retentionResult,
        ltvResult,
        demographicsResult,
        behaviorResult,
        topCustomersResult,
        monthlyCustomersResult,
      ] = await Promise.all([
        getDailyCustomerTraffic(dateRange.startDate, dateRange.endDate, branchId),
        getCustomerRetentionMetrics(dateRange.startDate, dateRange.endDate, branchId),
        getCustomerLifetimeValue(branchId),
        getCustomerDemographics(branchId),
        getCustomerBehavior(dateRange.startDate, dateRange.endDate, branchId),
        getTopCustomers(10, branchId),
        getMonthlyCustomers(dateRange.startDate, dateRange.endDate),
      ]);

      if (trafficResult.data) setDailyTraffic(trafficResult.data);
      if (retentionResult.data) setRetentionMetrics(retentionResult.data);
      if (ltvResult.data) setLifetimeValue(ltvResult.data);
      if (demographicsResult.data) setDemographics(demographicsResult.data);
      if (behaviorResult.data) setBehavior(behaviorResult.data);
      if (topCustomersResult.data) setTopCustomers(topCustomersResult.data);
      setMonthlyCustomersCount(monthlyCustomersResult.count);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
    } finally {
      setLoading(false);
    }
  };
  const customerMetrics = [
    {
      title: "Total Customers",
      value:
        retentionMetrics?.total_customers?.toString() ||
        monthlyCustomersCount.toString(),
      icon: UsersIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "New Customers",
      value: retentionMetrics?.new_customers?.toString() || "0",
      icon: UserPlusIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Retention Rate",
      value: retentionMetrics?.retention_rate
        ? `${retentionMetrics.retention_rate}%`
        : "0%",
      icon: ArrowTrendingUpIcon,
      color: "from-purple-100 to-purple-50",
      iconColor: "bg-purple-500",
    },
    {
      title: "Avg Lifetime Value",
      value: lifetimeValue?.average_ltv
        ? `₱${lifetimeValue.average_ltv.toLocaleString()}`
        : "₱0",
      icon: CurrencyDollarIcon,
      color: "from-orange-100 to-orange-50",
      iconColor: "bg-orange-500",
    },
  ];

  // Get peak day info
  const peakDay =
    dailyTraffic.length > 0
      ? dailyTraffic.reduce(
          (max, day) => (day.customer_count > max.customer_count ? day : max),
          dailyTraffic[0]
        )
      : null;

  // Customer type data for donut chart
  const customerTypeData = retentionMetrics
    ? [retentionMetrics.returning_customers, retentionMetrics.new_customers]
    : [0, 0];

  // Prepare x-axis categories for the chart
  const showMonths = isFullYearRange(dateRange.startDate, dateRange.endDate);
  let xCategories: string[];
  if (showMonths) {
    xCategories = [
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
    ];
  } else {
    xCategories = dailyTraffic.map((day) => {
      const date = new Date(day.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
  }

  // For showMonths, aggregate dailyTraffic by month for the data series
  let chartData: number[];
  if (showMonths) {
    chartData = Array(12).fill(0);
    dailyTraffic.forEach((day) => {
      const date = new Date(day.date);
      const month = date.getMonth();
      chartData[month] += day.customer_count;
    });
  } else {
    chartData = dailyTraffic.map((day) => day.customer_count);
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <CustomersSectionSkeleton />
      ) : (
        <>
          {/* Customer Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerMetrics.map((metric, index) => {
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
            {/* Daily Customer Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Daily Customer Traffic
                </h3>
                <span className="text-sm text-gray-500">
                  {dateRange.startDate.toLocaleDateString()} -{" "}
                  {dateRange.endDate.toLocaleDateString()}
                </span>
              </div>
              <ApexChart
                options={{
                  chart: { type: "bar", toolbar: { show: false } },
                  colors: ["#3B82F6"],
                  dataLabels: { enabled: false },
                  grid: { borderColor: "#E5E7EB" },
                  xaxis: {
                    categories: xCategories,
                    labels: {
                      rotate: -45,
                      style: { fontSize: "10px" },
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
                      columnWidth: "80%",
                    },
                  },
                  tooltip: {
                    custom: function ({ series, seriesIndex, dataPointIndex }) {
                      const day = dailyTraffic[dataPointIndex];
                      if (!day) return "";
                      return `<div class="bg-white p-3 rounded-lg shadow-lg border">
                        <div class="font-semibold text-gray-800 text-sm">${
                          day.day_name
                        }</div>
                        <div class="text-gray-600 text-xs mb-2">${new Date(
                          day.date
                        ).toLocaleDateString()}</div>
                        <div class="flex items-center">
                          <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span class="text-blue-600 font-bold text-sm">${
                            day.customer_count
                          } Customers</span>
                        </div>
                      </div>`;
                    },
                  },
                }}
                series={[
                  {
                    name: "Customers",
                    data: chartData,
                  },
                ]}
                type="bar"
                height={300}
              />
            </div>

            {/* Customer Type Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Type Distribution
              </h3>
              <ApexChart
                options={{
                  chart: { type: "donut" },
                  labels: ["Returning Customers", "New Customers"],
                  colors: ["#10B981", "#3B82F6"],
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
                            label: "Total",
                            formatter: () =>
                              retentionMetrics?.total_customers?.toString() ||
                              "0",
                          },
                        },
                      },
                    },
                  },
                  legend: {
                    position: "bottom",
                  },
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
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Insights
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Peak Day
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {peakDay ? peakDay.day_name : "No data"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {peakDay
                      ? `${peakDay.customer_count} customers on ${new Date(
                          peakDay.date
                        ).toLocaleDateString()}`
                      : "Highest customer traffic"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Avg. Order Frequency
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {behavior?.average_order_frequency
                        ? `${behavior.average_order_frequency}x`
                        : "0x"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Orders per customer
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      High Value Customers
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {lifetimeValue?.high_value_customers || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Above average LTV
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Churn Rate
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {retentionMetrics?.churn_rate
                        ? `${retentionMetrics.churn_rate}%`
                        : "0%"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Customer loss rate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Lifetime Value Analysis */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Value Distribution
              </h3>
            </div>
            <div className="p-6">
              {lifetimeValue ? (
                <ApexChart
                  options={{
                    chart: { type: "bar", toolbar: { show: false } },
                    colors: ["#10B981", "#3B82F6", "#EF4444"],
                    dataLabels: { enabled: true },
                    grid: { borderColor: "#E5E7EB" },
                    xaxis: {
                      categories: ["High Value", "Medium Value", "Low Value"],
                      labels: { style: { fontSize: "12px" } },
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
                      custom: function ({
                        series,
                        seriesIndex,
                        dataPointIndex,
                      }) {
                        const categories = [
                          "High Value",
                          "Medium Value",
                          "Low Value",
                        ];
                        const colors = ["#10B981", "#3B82F6", "#EF4444"];
                        const value = series[seriesIndex][dataPointIndex];
                        const category = categories[dataPointIndex];
                        const color = colors[dataPointIndex];

                        let description = "";
                        if (dataPointIndex === 0)
                          description = "Above average lifetime value";
                        else if (dataPointIndex === 1)
                          description = "Average lifetime value";
                        else description = "Below average lifetime value";

                        return `<div class="bg-white p-3 rounded-lg shadow-lg border">
                          <div class="font-semibold text-gray-800 text-sm">${category} Customers</div>
                          <div class="text-gray-600 text-xs mb-2">${description}</div>
                          <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${color}"></div>
                            <span class="font-bold text-sm" style="color: ${color}">${value} Customers</span>
                          </div>
                        </div>`;
                      },
                    },
                  }}
                  series={[
                    {
                      name: "Customers",
                      data: [
                        lifetimeValue.high_value_customers,
                        lifetimeValue.medium_value_customers,
                        lifetimeValue.low_value_customers,
                      ],
                    },
                  ]}
                  type="bar"
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  No customer value data available
                </div>
              )}
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Customers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Since
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topCustomers.length > 0 ? (
                    topCustomers.map((customer, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-8 w-8 rounded-full ${
                                index < 3
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              } flex items-center justify-center text-xs font-bold`}
                            >
                              {index < 3 ? (
                                <StarIcon className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.customer_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.total_orders}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₱{customer.total_spent.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            customer.last_order_date
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            customer.customer_since
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No customer data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
