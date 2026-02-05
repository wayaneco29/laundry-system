"use client";

import moment from "moment";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { UsersIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import { ApexOptions } from "apexcharts";
import { Calendar } from "lucide-react";

import { OrdersTable } from "@/app/components";
import { Select } from "@/app/components/common";
import { Datepicker } from "@/app/components/common/datepicker";
import { useUserContext } from "@/app/context/UserContext";
import { ROLE_ADMIN } from "@/app/types/role";
import { ChartBarIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import {
  MonthlySalesData,
  MonthlySalesChartData,
  getMonthlyCustomers,
  getTodayCustomers,
  getMonthSales,
  getMonthlySalesChart,
} from "@/app/actions";
import { getRecentOrders, RecentOrder } from "@/app/actions/order";
import {
  getMonthlyExpense,
  getYearlyExpense,
  getExpensesByCategory,
} from "@/app/actions/expense";
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from "./skeleton";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const chartOptions: ApexOptions = {
  chart: {
    height: 264,
    type: "area",
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    dropShadow: {
      enabled: false,
      top: 6,
      left: 0,
      blur: 4,
      color: "#000",
      opacity: 0.1,
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      inverseColors: false,
      opacityFrom: 0,
      opacityTo: 0,
      stops: [0, 90, 100],
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    colors: ["#487FFF"], // Specify the line color here
    width: 3,
  },
  markers: {
    size: 0,
    strokeWidth: 3,
    hover: {
      size: 8,
    },
  },
  tooltip: {
    enabled: true,
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

      // Get chartData from the component scope if possible, or use default formatting
      const formattedValue = `₱${value?.toLocaleString() || 0}`;

      return `<div class="bg-white p-3 rounded-lg shadow-lg border">
        <div class="font-semibold text-gray-800 text-sm">${monthName} ${new Date().getFullYear()}</div>
        <div class="text-gray-600 text-xs mb-2">Monthly Sales</div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span class="text-blue-600 font-bold text-sm">${formattedValue}</span>
        </div>
      </div>`;
    },
    x: {
      show: true,
    },
    y: {
      // show: false,
    },
    z: {
      // show: false,
    },
    cssClass: "text-gray-700",
  },
  grid: {
    row: {
      colors: ["transparent", "transparent"], // takes an array which will be repeated on columns
      opacity: 0.5,
    },
    borderColor: "#D1D5DB",
    strokeDashArray: 3,
  },
  yaxis: {
    labels: {
      formatter: function (value) {
        return "₱" + value + "k";
      },
      style: {
        fontSize: "14px",
      },
    },
  },
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
    tooltip: {
      enabled: false,
    },
    labels: {
      formatter: function (value: string) {
        return value;
      },
      style: {
        fontSize: "14px",
      },
    },
    axisBorder: {
      show: false,
    },
    crosshairs: {
      show: true,
      width: 20,
      stroke: {
        width: 0,
      },
      fill: {
        type: "solid",
        color: "#487FFF40",
      },
    },
  },
  // tooltip: {
  //   enabled: true,
  //   y: {
  //     formatter: function (value: string) {
  //       const currentDate = new Date();
  //       const monthNames = [
  //         "Jan",
  //         "Feb",
  //         "Mar",
  //         "Apr",
  //         "May",
  //         "Jun",
  //         "Jul",
  //         "Aug",
  //         "Sep",
  //         "Oct",
  //         "Nov",
  //         "Dec",
  //       ];
  //       const currentMonth = monthNames[currentDate.getMonth()];
  //       const currentYear = currentDate.getFullYear();

  //       return `Month: ${value} | Today: ${currentMonth} ${currentYear}`;
  //     },
  //   },
  //   cssClass: "text-gray-700",
  // },
};

const donutChartOptions = {
  colors: ["#FF9F29", "#487FFF", "#45B369", "#EF4444", "#8B5CF6", "#10B981"],
  legend: {
    show: false,
  },
  chart: {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    type: "donut" as "donut",
    height: 270,
    sparkline: {
      enabled: true, // Remove whitespace
    },
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  stroke: {
    width: 0,
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ],
};
type MainDashboardPage = {
  initialMonthlyCustomersCount: number;
  initialTodayCustomersCount: number;
  initialMonthlySalesData: MonthlySalesData | null;
  initialChartData: MonthlySalesChartData | null;
  initialBranches: any[];
  initialMonthlyExpense: number;
  initialYearlyExpense: number;
  initialRecentOrders: RecentOrder[];
  initialExpensesByCategory: any[];
};

export function MainDashboardPage({
  initialMonthlyCustomersCount,
  initialTodayCustomersCount,
  initialMonthlySalesData,
  initialChartData,
  initialBranches,
  initialMonthlyExpense,
  initialYearlyExpense,
  initialRecentOrders,
  initialExpensesByCategory,
}: MainDashboardPage) {
  const { role_name } = useUserContext();
  const isAdmin = role_name === ROLE_ADMIN;

  const [statsLoading, setStatsLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [chartKey, setChartKey] = useState(0); // Force chart re-render
  const [monthlyCustomersCount, setMonthlyCustomersCount] = useState(
    initialMonthlyCustomersCount,
  );
  const [todayCustomersCount, setTodayCustomersCount] = useState(
    initialTodayCustomersCount,
  );
  const [monthlySalesData, setMonthlySalesData] = useState(
    initialMonthlySalesData,
  );
  const [chartData, setChartData] = useState(initialChartData);
  const [recentOrders, setRecentOrders] =
    useState<RecentOrder[]>(initialRecentOrders);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(
    initialMonthlyExpense,
  );
  const [yearlyExpense, setYearlyExpense] =
    useState<number>(initialYearlyExpense);
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>(
    initialExpensesByCategory,
  );
  const [branches, setBranches] = useState<any[]>(initialBranches);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const isInitialMount = useRef(true);

  // Initialize with current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
    };
  };

  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>(getCurrentMonthRange());

  // Fetch data when branch filter or date range changes (skip initial mount)
  useEffect(() => {
    // Skip the first render to avoid fetching data twice
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Fetch data for any branch change, including "All Branches" (empty string)
    fetchDashboardData();
  }, [selectedBranch, dateRange]);

  // Force chart re-render when chart data changes
  useEffect(() => {
    // Force a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const chartElement = document.querySelector(
        '[data-apexcharts="sales-chart"]',
      );
      if (chartElement) {
        window.dispatchEvent(new Event("resize"));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [chartData]);

  const fetchDashboardData = async () => {
    setStatsLoading(true);
    setChartsLoading(true);
    setTableLoading(true);

    try {
      const branchId = selectedBranch === "" ? undefined : selectedBranch;

      const currentYear = new Date().getFullYear();

      // Convert string dates to Date objects for sales functions
      const salesStartDate = dateRange?.startDate
        ? new Date(dateRange.startDate)
        : undefined;
      const salesEndDate = dateRange?.endDate
        ? new Date(dateRange.endDate)
        : undefined;

      const [
        monthlyResult,
        todayResult,
        salesResult,
        chartResult,
        monthlyExpenseResult,
        yearlyExpenseResult,
        recentOrdersResult,
        expensesByCategoryResult,
      ] = await Promise.all([
        getMonthlyCustomers(),
        getTodayCustomers(),
        getMonthSales(branchId, salesStartDate, salesEndDate),
        getMonthlySalesChart(branchId, salesStartDate, salesEndDate),
        getMonthlyExpense(branchId, dateRange?.startDate, dateRange?.endDate),
        getYearlyExpense(branchId, dateRange?.startDate, dateRange?.endDate),
        getRecentOrders(
          10,
          branchId,
          dateRange?.startDate ? `${dateRange.startDate}T00:00:00` : undefined,
          dateRange?.endDate ? `${dateRange.endDate}T23:59:59` : undefined,
        ),
        getExpensesByCategory({
          startDate: dateRange?.startDate || `${currentYear}-01-01`,
          endDate: dateRange?.endDate || `${currentYear}-12-31`,
          branchId: branchId,
        }),
      ]);

      setMonthlyCustomersCount(monthlyResult.count);
      setTodayCustomersCount(todayResult.count);
      setMonthlySalesData(salesResult.data);
      setChartData(chartResult.data);
      setChartKey((prev) => prev + 1); // Force chart re-render
      setMonthlyExpense(monthlyExpenseResult.data || 0);
      setYearlyExpense(yearlyExpenseResult.data || 0);
      setRecentOrders(recentOrdersResult.data || []);
      setExpensesByCategory(expensesByCategoryResult.data || []);
    } catch (error) {
    } finally {
      setStatsLoading(false);
      setChartsLoading(false);
      setTableLoading(false);
    }
  };

  const handleBranchChange = (newValue: any) => {
    let branchValue: string;

    if (newValue === null) {
      // When user clears the selection, default to "All Branches"
      branchValue = "";
    } else if (typeof newValue === "object" && newValue !== null) {
      // React-select option object
      branchValue = newValue.value || "";
    } else {
      // Direct string value
      branchValue = newValue || "";
    }

    setSelectedBranch(branchValue);
  };

  const branchOptions = [
    { label: "All Branches", value: "" },
    ...branches.map((branch) => ({
      label: branch.name,
      value: branch.id,
    })),
  ];

  // Prepare dynamic donut chart data
  const donutChartSeries = expensesByCategory.map((item) =>
    Number(item.total_amount || 0),
  );
  const donutChartLabels = expensesByCategory.map(
    (item) => item.category_name || "Unknown",
  );

  const dynamicDonutChartOptions = {
    ...donutChartOptions,
    labels: donutChartLabels,
  };

  // Check if data is empty
  const isSalesDataEmpty =
    !chartData?.monthlyData ||
    chartData.monthlyData.every((value) => value === 0);
  const isExpensesDataEmpty =
    !expensesByCategory || expensesByCategory.length === 0;

  // Dynamic chart options based on data scale
  const dynamicChartOptions: ApexOptions = {
    chart: {
      id: "sales-chart",
      height: 264,
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      dropShadow: {
        enabled: false,
        top: 6,
        left: 0,
        blur: 4,
        color: "#000",
        opacity: 0.1,
      },
      redrawOnWindowResize: true,
      redrawOnParentResize: true,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      colors: ["#487FFF"],
      width: 3,
    },
    markers: {
      size: 0,
      strokeWidth: 3,
      hover: {
        size: 8,
      },
    },
    tooltip: {
      enabled: true,
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
        const formattedValue = `₱${value?.toLocaleString() || 0}`;

        return `<div class="bg-white p-3 rounded-lg shadow-lg border">
          <div class="font-semibold text-gray-800 text-sm">${monthName} ${new Date().getFullYear()}</div>
          <div class="text-gray-600 text-xs mb-2">Monthly Sales</div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span class="text-blue-600 font-bold text-sm">${formattedValue}</span>
          </div>
        </div>`;
      },
      x: {
        show: true,
      },
      cssClass: "text-gray-700",
    },
    grid: {
      row: {
        colors: ["transparent", "transparent"],
        opacity: 0.5,
      },
      borderColor: "#D1D5DB",
      strokeDashArray: 3,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          if (chartData?.useThousands) {
            return "₱" + value + "k";
          }
          return "₱" + value;
        },
        style: {
          fontSize: "14px",
        },
      },
    },
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
      tooltip: {
        enabled: false,
      },
      labels: {
        formatter: function (value: string) {
          return value;
        },
        style: {
          fontSize: "14px",
        },
      },
      axisBorder: {
        show: false,
      },
      crosshairs: {
        show: true,
        width: 20,
        stroke: {
          width: 0,
        },
        fill: {
          type: "solid",
          color: "#487FFF40",
        },
      },
    },
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="text-center sm:text-start">
          <h1 className="text-gray-700 text-2xl font-medium">Dashboard</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Datepicker
            mode="range"
            value={dateRange ?? undefined}
            label="Filter by Date"
            onChange={(result) => {
              if (result === null || result === undefined) {
                setDateRange(getCurrentMonthRange());
              } else if (typeof result === "object" && "startDate" in result) {
                setDateRange(result);
              }
            }}
            placeholder="Select date range"
            disabled={statsLoading || chartsLoading || tableLoading}
            className="h-12 min-w-[200px]"
          />
          <div className="w-full sm:w-64">
            <Select
              label="Filter by Branch"
              isSearchable={false}
              options={branchOptions}
              value={selectedBranch}
              onChange={handleBranchChange}
              placeholder="Select branch..."
            />
          </div>
        </div>
      </div>

      {/* Date range display */}
      {dateRange && (
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            Showing data from{" "}
            <strong>
              {moment(dateRange.startDate, "YYYY-MM-DD").format("MMM DD, YYYY")}
            </strong>{" "}
            to{" "}
            <strong>
              {moment(dateRange.endDate, "YYYY-MM-DD").format("MMM DD, YYYY")}
            </strong>
          </span>
          <button
            onClick={() => {
              setDateRange(getCurrentMonthRange());
            }}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Stats Cards Section */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {Array.from({ length: isAdmin ? 6 : 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-violet-100 to-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-gray-700 text-sm font-medium">
                  This Month Customers
                </div>
                <div className="text-gray-700 text-2xl font-bold mt-2">
                  {monthlyCustomersCount}
                </div>
              </div>
              <div className="p-3 rounded-full bg-violet-400 h-fit shrink-0">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-violet-100 to-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-gray-700 text-sm font-medium">
                  Todays Customers
                </div>
                <div className="text-gray-700 text-2xl font-bold mt-2">
                  {todayCustomersCount}
                </div>
              </div>
              <div className="p-3 rounded-full bg-violet-400 h-fit shrink-0">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          {isAdmin && (
            <>
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-green-100 to-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 text-sm font-medium">
                      This Month Paid Sales
                    </div>
                    <div className="text-gray-700 text-xl sm:text-2xl font-bold mt-2 truncate">
                      ₱{monthlySalesData?.paidSales?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-green-400 h-fit shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-amber-100 to-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 text-sm font-medium">
                      This Month Unpaid Sales
                    </div>
                    <div className="text-amber-600 text-xl sm:text-2xl font-bold mt-2 truncate">
                      ₱{monthlySalesData?.unpaidSales?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-amber-400 h-fit shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-blue-100 to-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 text-sm font-medium">
                      This Month Total Sales
                    </div>
                    <div className="text-gray-700 text-xl sm:text-2xl font-bold mt-2 truncate">
                      ₱{monthlySalesData?.totalSales?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-blue-400 h-fit shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-red-100 to-white">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="text-gray-700 text-sm font-medium">
                  This Month Expenses
                </div>
                <div className="text-gray-700 text-xl sm:text-2xl font-bold mt-2 truncate">
                  ₱{monthlyExpense?.toLocaleString() || "0"}
                </div>
              </div>
              <div className="p-3 rounded-full bg-red-500 h-fit shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {chartsLoading ? (
        <div
          className={`grid grid-cols-1 ${isAdmin ? "xl:grid-cols-2" : ""} mt-6 gap-4`}
        >
          {isAdmin && <ChartSkeleton />}
          <ChartSkeleton />
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 ${isAdmin ? "xl:grid-cols-2" : ""} mt-6 gap-4`}
        >
          {isAdmin && (
            <div className="bg-white rounded-md p-4 shadow-md overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-700 font-medium text-base sm:text-lg">
                  Sales Overview
                </div>
              </div>
              <div className="text-gray-700 font-bold text-lg sm:text-xl truncate">
                ₱{chartData?.totalYearSales?.toLocaleString() || "0"}
              </div>
              <div
                data-apexcharts="sales-chart"
                className="w-full overflow-hidden"
              >
                {isSalesDataEmpty ? (
                  <div className="flex flex-col items-center justify-center h-[264px] text-gray-400">
                    <ChartBarIcon className="h-16 w-16 mb-3" />
                    <p className="text-sm font-medium text-gray-500">
                      No Sales Data Available
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Sales data will appear here once you have transactions
                    </p>
                  </div>
                ) : (
                  <ReactApexChart
                    key={`sales-chart-${chartKey}-${selectedBranch}`}
                    options={dynamicChartOptions}
                    series={[
                      {
                        name: "",
                        data: chartData?.monthlyData || [
                          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        ],
                      },
                    ]}
                    type="area"
                    height={264}
                  />
                )}
              </div>
            </div>
          )}
          <div className="bg-white rounded-md p-4 shadow-md overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-700 font-medium text-base sm:text-lg">
                Expenses Overview
              </div>
            </div>
            <div className="text-gray-700 font-bold text-lg sm:text-xl truncate">
              ₱{yearlyExpense?.toLocaleString() || "0"}
            </div>
            <div className="w-full overflow-hidden">
              {isExpensesDataEmpty ? (
                <div className="flex flex-col items-center justify-center h-[264px] text-gray-400">
                  <BanknotesIcon className="h-16 w-16 mb-3" />
                  <p className="text-sm font-medium text-gray-500">
                    No Expenses Data Available
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Expense data will appear here once you add expenses
                  </p>
                </div>
              ) : (
                <ReactApexChart
                  options={dynamicDonutChartOptions}
                  series={donutChartSeries}
                  type="donut"
                  height={264}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      {tableLoading ? (
        <div className="mt-6">
          <TableSkeleton />
        </div>
      ) : (
        <div className="bg-white rounded-md shadow-md p-4 mt-6 overflow-x-auto">
          <div className="text-gray-700 mb-4 font-medium text-base sm:text-lg">
            Latest Transaction
          </div>
          <div className="flex flex-col">
            <OrdersTable
              initialData={recentOrders.map((order) => ({
                order_id: order.id,
                customer_name: order.customer_name,
                created_at: order.created_at,
                branch_name: order.branch_name,
                order_status: order.status,
                payment_status: order.payment_status,
                total_price: order.total_amount.toLocaleString(),
              }))}
              totalCount={recentOrders.length}
              isDashboardView={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
