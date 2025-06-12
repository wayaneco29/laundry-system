"use client";

import dynamic from "next/dynamic";
import { UsersIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import { ApexOptions } from "apexcharts";

import { OrdersTable } from "@/app/components";
import { getMonthlyCustomers } from "@/app/actions";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const chartSeries = [
  {
    name: "This month",
    data: [10, 20, 12, 30, 14, 35, 16, 32, 14, 25, 13, 28],
  },
];

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

const donutChartSeries = [1000, 200, 2500];

const donutChartOptions = {
  colors: ["#FF9F29", "#487FFF", "#45B369"],
  labels: ["Detergent", "Water", "Electricity"],
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
  monthlyCustomersCount: number;
};
export function MainDashboardPage({
  monthlyCustomersCount,
}: MainDashboardPage) {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-gray-700 text-2xl font-medium">Dashboard</h1>
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
              <div className="text-gray-700 text-xl font-bold mt-2">42</div>
            </div>
            <div className="p-3 rounded-full bg-violet-400 h-fit">
              <UsersIcon height={25} />
            </div>
          </div>
        </div>
        <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-orange-100 to-white">
          <div className="flex justify-between">
            <div>
              <div className="text-gray-700 text-sm font-medium">
                This Month Sales
              </div>
              <div className="text-gray-700 text-xl font-bold mt-2">
                ₱28,970
              </div>
            </div>
            <div className="p-3 rounded-full bg-orange-400 h-fit">
              <CurrencyDollarIcon height={25} />
            </div>
          </div>
        </div>
        <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-orange-100 to-white">
          <div className="flex justify-between">
            <div>
              <div className="text-gray-700 text-sm font-medium">
                Todays Sales
              </div>
              <div className="text-gray-700 text-xl font-bold mt-2">
                ₱13,240
              </div>
            </div>
            <div className="p-3 rounded-full bg-orange-400 h-fit">
              <CurrencyDollarIcon height={25} />
            </div>
          </div>
        </div>
        <div className="shadow-sm rounded-md p-4 bg-gradient-to-r from-red-100 to-white">
          <div className="flex justify-between">
            <div>
              <div className="text-gray-700 text-sm font-medium">
                Total Expenses
              </div>
              <div className="text-gray-700 text-xl font-bold mt-2">
                ₱14,580
              </div>
            </div>
            <div className="p-3 rounded-full bg-red-500 h-fit">
              <CurrencyDollarIcon height={25} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 mt-8 gap-4">
        <div className="bg-white rounded-md p-4 shadow-md">
          <div className="flex justify-between">
            <div className="text-gray-700 font-medium">Sales Overview</div>
            <div className="text-gray-700">Yearly</div>
          </div>
          <div className="text-gray-700 font-bold text-lg">₱27,000</div>
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={264}
          />
        </div>
        <div className="bg-white rounded-md p-4 shadow-md">
          <div className="flex justify-between">
            <div className="text-gray-700 font-medium">Expenses Overview</div>
            <div className="text-gray-700">This Month</div>
          </div>
          <div className="text-gray-700 font-bold text-lg">₱8,050.50</div>
          <ReactApexChart
            options={donutChartOptions}
            series={donutChartSeries}
            type="donut"
            height={264}
          />
        </div>
      </div>
      <div className="bg-white rounded-md shadow-md p-4">
        <div className="text-gray-700 mb-4 text-lg">Latest Transaction</div>
        <div className="flex flex-col">
          <OrdersTable data={[]} />
        </div>
      </div>
    </div>
  );
}
