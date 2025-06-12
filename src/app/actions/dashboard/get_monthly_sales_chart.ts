"use server";

import { createClient } from "@/app/utils/supabase/server";

export type MonthlySalesChartData = {
  monthlyData: number[];
  totalYearSales: number;
  monthNames: string[];
  useThousands: boolean;
};

export async function getMonthlySalesChart(): Promise<{
  data: MonthlySalesChartData | null;
  error: string | null;
}> {
  const supabase = await createClient();

  try {
    const currentYear = new Date().getFullYear();

    // Get sales data for the current year
    const { data: salesData, error } = await supabase
      .from("sales")
      .select("total_price, created_at")
      .gte("created_at", `${currentYear}-01-01T00:00:00.000Z`)
      .lt("created_at", `${currentYear + 1}-01-01T00:00:00.000Z`)
      .eq("status", "Paid"); // Only include paid sales for the chart
    console.log(salesData, error);
    if (error) throw error;

    // Initialize monthly data array (12 months)
    const monthlyData = new Array(12).fill(0);
    const monthNames = [
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

    // Group sales by month
    salesData?.forEach((sale) => {
      if (sale.created_at && sale.total_price) {
        const saleDate = new Date(sale.created_at);
        const monthIndex = saleDate.getMonth(); // 0-11
        monthlyData[monthIndex] += sale.total_price;
      }
    });

    // Calculate total year sales
    const totalYearSales = monthlyData.reduce((sum, amount) => sum + amount, 0);

    // Use actual values if total is less than 10k, otherwise convert to thousands
    const shouldUseThousands = totalYearSales >= 10000;
    const displayData = shouldUseThousands 
      ? monthlyData.map((amount) => Math.round(amount / 1000))
      : monthlyData;

    const chartData: MonthlySalesChartData = {
      monthlyData: displayData,
      totalYearSales,
      monthNames,
      useThousands: shouldUseThousands,
    };

    return { data: chartData, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
