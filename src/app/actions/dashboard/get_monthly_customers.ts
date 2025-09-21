"use server";

import { createClient } from "@/app/utils/supabase/server";
import moment from "moment";

export async function getMonthlyCustomers(
  branchId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const supabase = await createClient();

  try {
    // Use provided date range or default to current month
    const today = new Date();
    const monthStart =
      (startDate || new Date(today.getFullYear(), today.getMonth(), 1))
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";
    const monthEnd =
      moment(
        endDate ||
          new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      )
        .add("day", 1)
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";
    // Build query with optional branch filter
    let query = supabase
      .from("customers")
      .select("*")
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd);

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data: monthlyCustomers, error } = await query.order("created_at", {
      ascending: false,
    });

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
