"use client";

import { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  MonthlySalesData,
  MonthlySalesChartData,
  getMonthSales,
  getMonthlySalesChart,
} from "@/app/actions";
import { ApexChart } from "@/app/components/charts/apex-chart";
import { SalesSectionSkeleton } from "./skeleton";

type SalesReportSectionProps = {
  monthlySalesData: MonthlySalesData | null;
  chartData: MonthlySalesChartData | null;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  branchId?: string;
};

export function SalesReportSection({
  monthlySalesData: initialMonthlySalesData,
  chartData: initialChartData,
  dateRange,
  branchId,
}: SalesReportSectionProps) {
  const [monthlySalesData, setMonthlySalesData] =
    useState<MonthlySalesData | null>(initialMonthlySalesData);
  const [chartData, setChartData] = useState<MonthlySalesChartData | null>(
    initialChartData
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, [dateRange, branchId]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const [salesResult, chartResult] = await Promise.all([
        getMonthSales(branchId, dateRange.startDate, dateRange.endDate),
        getMonthlySalesChart(branchId, dateRange.startDate, dateRange.endDate),
      ]);

      if (salesResult.data) {
        setMonthlySalesData(salesResult.data);
      }
      if (chartResult.data) {
        setChartData(chartResult.data);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const salesMetrics = [
    {
      title: "Total Sales",
      value: `₱${monthlySalesData?.totalSales?.toLocaleString() || "0"}`,
      icon: CurrencyDollarIcon,
      color: "from-blue-100 to-blue-50",
      iconColor: "bg-blue-500",
    },
    {
      title: "Paid Sales",
      value: `₱${monthlySalesData?.paidSales?.toLocaleString() || "0"}`,
      icon: ArrowTrendingUpIcon,
      color: "from-green-100 to-green-50",
      iconColor: "bg-green-500",
    },
    {
      title: "Unpaid Sales",
      value: `₱${monthlySalesData?.unpaidSales?.toLocaleString() || "0"}`,
      icon: ArrowTrendingDownIcon,
      color: "from-red-100 to-red-50",
      iconColor: "bg-red-500",
    },
    {
      title: "Collection Rate",
      value: `${
        monthlySalesData?.totalSales
          ? Math.round(
              (monthlySalesData.paidSales / monthlySalesData.totalSales) * 100
            )
          : 0
      }%`,
      icon: CalendarIcon,
      color: "from-purple-100 to-purple-50",
      iconColor: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {loading ? (
        <SalesSectionSkeleton />
      ) : (
        <>
          {/* Sales Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {salesMetrics.map((metric, index) => {
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
            {/* Monthly Sales Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Monthly Sales Trend
                </h3>
                <span className="text-sm text-gray-500">This Year</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-4">
                ₱{chartData?.totalYearSales?.toLocaleString() || "0"}
              </div>
              <ApexChart
                options={{
                  chart: { type: "line", toolbar: { show: false } },
                  stroke: { curve: "smooth", colors: ["#3B82F6"], width: 3 },
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
                  markers: { size: 4, colors: ["#3B82F6"] },
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
                type="line"
                height={300}
              />
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Status Breakdown
              </h3>
              <ApexChart
                options={{
                  chart: { type: "donut" },
                  labels: ["Paid", "Unpaid"],
                  colors: ["#10B981", "#EF4444"],
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
                            label: "Total Sales",
                            formatter: () =>
                              `₱${
                                monthlySalesData?.totalSales?.toLocaleString() ||
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
                  monthlySalesData?.paidSales || 0,
                  monthlySalesData?.unpaidSales || 0,
                ]}
                type="donut"
                height={300}
              />
            </div>
          </div>

          {/* Detailed Sales Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sales Performance Summary
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Average Order Value
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₱
                      {monthlySalesData?.totalSales &&
                      monthlySalesData.totalSales > 0
                        ? Math.round(
                            monthlySalesData.totalSales / 30
                          ).toLocaleString() // Rough monthly average
                        : "0"}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Daily Average
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₱
                      {monthlySalesData?.totalSales
                        ? Math.round(
                            monthlySalesData.totalSales / new Date().getDate()
                          ).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Outstanding Amount
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      ₱{monthlySalesData?.unpaidSales?.toLocaleString() || "0"}
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
