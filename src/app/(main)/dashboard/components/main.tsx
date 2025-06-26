"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { UsersIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import { ApexOptions } from "apexcharts";

import { OrdersTable } from "@/app/components";
import { Select } from "@/app/components/common";
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
import { getAllBranches } from "@/app/actions/branch";
import {
  DashboardSkeleton,
  StatCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "./skeleton";

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

const defaultDonutChartSeries = [1000, 200, 2500];
const defaultDonutChartLabels = ["Detergent", "Water", "Electricity"];

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
};

export function MainDashboardPage({
  initialMonthlyCustomersCount,
  initialTodayCustomersCount,
  initialMonthlySalesData,
  initialChartData,
}: MainDashboardPage) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [chartKey, setChartKey] = useState(0); // Force chart re-render
  const [monthlyCustomersCount, setMonthlyCustomersCount] = useState(
    initialMonthlyCustomersCount
  );
  const [todayCustomersCount, setTodayCustomersCount] = useState(
    initialTodayCustomersCount
  );
  const [monthlySalesData, setMonthlySalesData] = useState(
    initialMonthlySalesData
  );
  const [chartData, setChartData] = useState(initialChartData);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(0);
  const [yearlyExpense, setYearlyExpense] = useState<number>(0);
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const isInitialRender = useRef(true);

  // Fetch branches and initial expense data on component mount
  useEffect(() => {
    const initializeData = async () => {
      console.log("Initializing dashboard data...");
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchBranches(),
          fetchInitialExpenseData(),
          fetchInitialRecentOrders(),
        ]);
        console.log("Initial data loaded, selectedBranch:", selectedBranch);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchInitialRecentOrders = async () => {
    setTableLoading(true);
    try {
      const result = await getRecentOrders(10);
      if (result.data) {
        setRecentOrders(result.data);
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchInitialExpenseData = async () => {
    setChartsLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const [
        monthlyExpenseResult,
        yearlyExpenseResult,
        expensesByCategoryResult,
      ] = await Promise.all([
        getMonthlyExpense(),
        getYearlyExpense(),
        getExpensesByCategory({
          startDate: `${currentYear}-01-01`,
          endDate: `${currentYear}-12-31`,
        }),
      ]);
      setMonthlyExpense(monthlyExpenseResult.data || 0);
      setYearlyExpense(yearlyExpenseResult.data || 0);
      setExpensesByCategory(expensesByCategoryResult.data || []);
    } catch (error) {
      console.error("Error fetching initial expense data:", error);
    } finally {
      setChartsLoading(false);
    }
  };

  // Fetch data when branch changes
  useEffect(() => {
    console.log(
      "useEffect triggered for selectedBranch:",
      selectedBranch,
      "isInitialRender:",
      isInitialRender.current
    );

    // Skip the first render to avoid fetching data twice
    if (isInitialRender.current) {
      console.log("Skipping first render");
      isInitialRender.current = false;
      return;
    }

    // Fetch data for any branch change, including "All Branches" (empty string)
    console.log("Branch changed, fetching data for:", selectedBranch);
    fetchDashboardData();
  }, [selectedBranch]);

  // Debug useEffect to track selectedBranch changes
  useEffect(() => {
    console.log("selectedBranch state changed to:", selectedBranch);
  }, [selectedBranch]);

  // Force chart re-render when chart data changes
  useEffect(() => {
    console.log("Chart data changed, forcing re-render");
    // Force a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const chartElement = document.querySelector(
        '[data-apexcharts="sales-chart"]'
      );
      if (chartElement) {
        console.log("Chart element found, triggering resize");
        window.dispatchEvent(new Event("resize"));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [chartData]);

  const fetchBranches = async () => {
    try {
      console.log("Fetching branches...");
      const result = await getAllBranches();
      console.log("Branches result:", result);
      if (result.data) {
        setBranches(result.data);
        console.log("Branches set:", result.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchDashboardData = async () => {
    console.log("Fetching dashboard data for branch:", selectedBranch);
    setStatsLoading(true);
    setChartsLoading(true);
    setTableLoading(true);

    try {
      const branchId = selectedBranch === "" ? undefined : selectedBranch;
      console.log("Using branchId:", branchId);

      const currentYear = new Date().getFullYear();
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
        getMonthlyCustomers(branchId),
        getTodayCustomers(branchId),
        getMonthSales(branchId),
        getMonthlySalesChart(branchId),
        getMonthlyExpense(branchId),
        getYearlyExpense(branchId),
        getRecentOrders(10, branchId),
        getExpensesByCategory({
          startDate: `${currentYear}-01-01`,
          endDate: `${currentYear}-12-31`,
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
      console.error("Error fetching dashboard data:", error);
    } finally {
      setStatsLoading(false);
      setChartsLoading(false);
      setTableLoading(false);
    }
  };

  const handleBranchChange = (newValue: any) => {
    console.log("handleBranchChange called with:", newValue);

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

    console.log("Branch changed to:", branchValue);
    setSelectedBranch(branchValue);
  };

  const branchOptions = [
    { label: "All Branches", value: "" },
    ...branches.map((branch) => ({
      label: branch.name,
      value: branch.id,
    })),
  ];

  console.log("Branch options:", branchOptions);

  // Prepare dynamic donut chart data
  const hasExpenseData = expensesByCategory.length > 0;
  const donutChartSeries = hasExpenseData
    ? expensesByCategory.map((item) => Number(item.total_amount || 0))
    : defaultDonutChartSeries;
  const donutChartLabels = hasExpenseData
    ? expensesByCategory.map((item) => item.category_name || "Unknown")
    : defaultDonutChartLabels;

  const dynamicDonutChartOptions = {
    ...donutChartOptions,
    labels: donutChartLabels,
  };

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

  // Debug chart data
  console.log("Chart data:", chartData);
  console.log(
    "Chart options categories:",
    dynamicChartOptions.xaxis?.categories
  );
  console.log(
    "Chart series data:",
    chartData?.monthlyData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-gray-700 text-2xl font-medium">Dashboard</h1>
        <div className="w-64">
          <Select
            label="Filter by Branch"
            options={branchOptions}
            value={selectedBranch}
            onChange={handleBranchChange}
            placeholder="Select branch..."
          />
        </div>
      </div>

      {initialLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Cards Section */}
          {statsLoading ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-violet-100 to-white">
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-700 text-sm font-medium">
                      This Month Customers
                    </div>
                    <div className="text-gray-700 text-xl font-bold mt-2">
                      {monthlyCustomersCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-violet-400 h-fit">
                    <UsersIcon height={25} />
                  </div>
                </div>
              </div>
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-violet-100 to-white">
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-700 text-sm font-medium">
                      Todays Customers
                    </div>
                    <div className="text-gray-700 text-xl font-bold mt-2">
                      {todayCustomersCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-violet-400 h-fit">
                    <UsersIcon height={25} />
                  </div>
                </div>
              </div>
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-green-100 to-white">
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-700 text-sm font-medium">
                      This Month Paid Sales
                    </div>
                    <div className="text-gray-700 text-xl font-bold mt-2">
                      ₱{monthlySalesData?.paidSales?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-green-400 h-fit">
                    <CurrencyDollarIcon height={25} />
                  </div>
                </div>
              </div>
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-red-100 to-white">
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-700 text-sm font-medium">
                      This Month Unpaid Sales
                    </div>
                    <div className="text-gray-700 text-xl font-bold mt-2">
                      ₱{monthlySalesData?.unpaidSales?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-red-400 h-fit">
                    <CurrencyDollarIcon height={25} />
                  </div>
                </div>
              </div>
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-blue-100 to-white">
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-700 text-sm font-medium">
                      This Month Total Sales
                    </div>
                    <div className="text-gray-700 text-xl font-bold mt-2">
                      ₱{monthlySalesData?.totalSales?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-blue-400 h-fit">
                    <CurrencyDollarIcon height={25} />
                  </div>
                </div>
              </div>
              <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-red-100 to-white">
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-700 text-sm font-medium">
                      This Month Expenses
                    </div>
                    <div className="text-gray-700 text-xl font-bold mt-2">
                      ₱{monthlyExpense?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-red-500 h-fit">
                    <CurrencyDollarIcon height={25} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          {chartsLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 mt-8 gap-4">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 mt-8 gap-4">
              <div className="bg-white rounded-md p-4 shadow-md">
                <div className="flex justify-between">
                  <div className="text-gray-700 font-medium">
                    Sales Overview
                  </div>
                </div>
                <div className="text-gray-700 font-bold text-lg">
                  ₱{chartData?.totalYearSales?.toLocaleString() || "0"}
                </div>
                <div data-apexcharts="sales-chart">
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
                </div>
              </div>
              <div className="bg-white rounded-md p-4 shadow-md">
                <div className="flex justify-between">
                  <div className="text-gray-700 font-medium">
                    Expenses Overview
                  </div>
                </div>
                <div className="text-gray-700 font-bold text-lg">
                  ₱{yearlyExpense?.toLocaleString() || "0"}
                </div>
                <ReactApexChart
                  options={dynamicDonutChartOptions}
                  series={donutChartSeries}
                  type="donut"
                  height={264}
                />
              </div>
            </div>
          )}

          {/* Table Section */}
          {tableLoading ? (
            <div className="mt-8">
              <TableSkeleton />
            </div>
          ) : (
            <div className="bg-white rounded-md shadow-md p-4 mt-8">
              <div className="text-gray-700 mb-4 font-medium">
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
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
