// ====================================================================
// CHART UTILITIES FOR DYNAMIC DATE RANGE CHARTS
// ====================================================================

export interface ChartTimeRange {
  type: "hour" | "day" | "week" | "month" | "quarter" | "year";
  categories: string[];
  dataPoints: number;
  label: string;
}

export interface DynamicChartData {
  categories: string[];
  data: number[];
  timeRange: ChartTimeRange;
}

// ====================================================================
// DATE RANGE ANALYSIS
// ====================================================================

export const analyzeDateRange = (
  startDate: Date,
  endDate: Date
): ChartTimeRange => {
  const diffInMs = endDate.getTime() - startDate.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));

  // Same day - show hours
  if (diffInDays === 1 && startDate.toDateString() === endDate.toDateString()) {
    return {
      type: "hour",
      categories: generateHourCategories(startDate),
      dataPoints: 24,
      label: "Hours",
    };
  }

  // 1-7 days - show days
  if (diffInDays <= 7) {
    return {
      type: "day",
      categories: generateDayCategories(startDate, endDate),
      dataPoints: diffInDays,
      label: "Days",
    };
  }

  // 8-31 days - show weeks
  if (diffInDays <= 31) {
    return {
      type: "week",
      categories: generateWeekCategories(startDate, endDate),
      dataPoints: Math.ceil(diffInDays / 7),
      label: "Weeks",
    };
  }

  // 32-365 days - show months
  if (diffInDays <= 365) {
    return {
      type: "month",
      categories: generateMonthCategories(startDate, endDate),
      dataPoints: Math.ceil(diffInDays / 30),
      label: "Months",
    };
  }

  // More than 1 year - show quarters
  if (diffInDays <= 365 * 3) {
    return {
      type: "quarter",
      categories: generateQuarterCategories(startDate, endDate),
      dataPoints: Math.ceil(diffInDays / 90),
      label: "Quarters",
    };
  }

  // More than 3 years - show years
  return {
    type: "year",
    categories: generateYearCategories(startDate, endDate),
    dataPoints: Math.ceil(diffInDays / 365),
    label: "Years",
  };
};

// ====================================================================
// CATEGORY GENERATORS
// ====================================================================

const generateHourCategories = (date: Date): string[] => {
  const categories = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0");
    categories.push(`${hour}:00`);
  }
  return categories;
};

const generateDayCategories = (startDate: Date, endDate: Date): string[] => {
  const categories = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    categories.push(
      currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    );
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return categories;
};

const generateWeekCategories = (startDate: Date, endDate: Date): string[] => {
  const categories = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    categories.push(
      `Week ${weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`
    );

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return categories;
};

const generateMonthCategories = (startDate: Date, endDate: Date): string[] => {
  const categories = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    categories.push(
      currentDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    );
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return categories;
};

const generateQuarterCategories = (
  startDate: Date,
  endDate: Date
): string[] => {
  const categories = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
    const year = currentDate.getFullYear();
    categories.push(`Q${quarter} ${year}`);
    currentDate.setMonth(currentDate.getMonth() + 3);
  }

  return categories;
};

const generateYearCategories = (startDate: Date, endDate: Date): string[] => {
  const categories = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    categories.push(currentDate.getFullYear().toString());
    currentDate.setFullYear(currentDate.getFullYear() + 1);
  }

  return categories;
};

// ====================================================================
// CHART OPTIONS GENERATOR
// ====================================================================

export const generateChartOptions = (
  timeRange: ChartTimeRange,
  chartData: any,
  title: string = "Sales Trend"
) => {
  const baseOptions = {
    chart: {
      type: "area" as const,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth" as const,
      colors: ["#3B82F6"],
      width: 2,
    },
    fill: {
      type: "gradient" as const,
      gradient: { opacityFrom: 0.3, opacityTo: 0 },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#E5E7EB" },
    xaxis: {
      categories: timeRange.categories,
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        formatter: (value: number) =>
          `₱${value}${chartData?.useThousands ? "k" : ""}`,
        style: { fontSize: "12px" },
      },
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex }: any) {
        const category = timeRange.categories[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        const formattedValue = chartData?.useThousands
          ? `₱${value}k`
          : `₱${value?.toLocaleString() || 0}`;

        // Calculate percentage of total
        const total = series[seriesIndex].reduce(
          (sum: number, val: number) => sum + val,
          0
        );
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

        return `<div class="bg-white p-3 rounded-lg shadow-lg border">
          <div class="font-semibold text-gray-800 text-sm">${category}</div>
          <div class="text-gray-600 text-xs mb-2">${title}</div>
          <div class="space-y-1">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span class="text-blue-600 font-bold text-sm">${formattedValue}</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span class="text-green-600 text-sm">${percentage}% of total</span>
            </div>
          </div>
        </div>`;
      },
    },
  };

  return baseOptions;
};

// ====================================================================
// MOCK DATA GENERATOR (for demonstration)
// ====================================================================

export const generateMockData = (timeRange: ChartTimeRange): number[] => {
  const data = [];
  for (let i = 0; i < timeRange.dataPoints; i++) {
    // Generate realistic sales data with some variation
    const baseValue = 10000 + Math.random() * 50000;
    const variation = 0.3; // 30% variation
    const randomFactor = 1 + (Math.random() - 0.5) * variation;
    data.push(Math.round(baseValue * randomFactor));
  }
  return data;
};

// ====================================================================
// DATE RANGE LABEL GENERATOR
// ====================================================================

export const getDateRangeLabel = (startDate: Date, endDate: Date): string => {
  const timeRange = analyzeDateRange(startDate, endDate);

  switch (timeRange.type) {
    case "hour":
      return "Today";
    case "day":
      return "This Week";
    case "week":
      return "This Month";
    case "month":
      return "This Year";
    case "quarter":
      return "Multi-Year";
    case "year":
      return "Long Term";
    default:
      return "Custom Range";
  }
};
