"use server";

import { createClient } from "@/app/utils/supabase/server";

export type DailyCustomerTraffic = {
  date: string;
  customer_count: number;
  day_name: string;
};

export const getDailyCustomerTraffic = async (
  startDate: Date,
  endDate: Date,
  branchId?: string
) => {
  const supabase = await createClient();

  try {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    // Query to get daily customer counts
    let query = supabase
      .from("orders")
      .select("created_at, branch_id")
      .gte("created_at", start)
      .lte("created_at", end);

    // Apply branch filter if provided
    if (branchId && branchId !== "") {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group orders by date and count unique customers per day
    const dailyTraffic: Record<string, Set<string>> = {};
    
    data?.forEach((order) => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (!dailyTraffic[orderDate]) {
        dailyTraffic[orderDate] = new Set();
      }
      // Note: We're counting orders as customer visits
      // In a real scenario, you might want to count unique customer_ids
      dailyTraffic[orderDate].add(order.created_at);
    });

    // Convert to array format and fill missing dates with 0
    const result: DailyCustomerTraffic[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      result.push({
        date: dateStr,
        customer_count: dailyTraffic[dateStr]?.size || 0,
        day_name: dayNames[currentDate.getDay()]
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error("getDailyCustomerTraffic", error);
    return {
      data: [],
      error,
    };
  }
};