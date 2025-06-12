"use server";

import { createClient } from "@/app/utils/supabase/server";

export async function getMonthlyCustomers() {
  const supabase = await createClient();

  try {
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    // Get customers created in current month
    const { data: monthlyCustomers, error } = await supabase
      .from("customers")
      .select("*")
      .gte("created_at", monthStart.toISOString())
      .lte("created_at", monthEnd.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Monthly customers query error:", error);
      throw error;
    }

    return {
      data: monthlyCustomers || [],
      count: monthlyCustomers?.length || 0,
      error: null,
    };
  } catch (error) {
    console.error("Get monthly customers error:", error);
    return {
      data: [],
      count: 0,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch monthly customers",
    };
  }
}
