"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getMonthlyExpense = async (
  branchId?: string,
  startDate?: string,
  endDate?: string
) => {
  const supabase = await createClient();

  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Create start and end dates for the current month (or use provided dates)
    const defaultStartDate = `${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}-01`;
    // Get the last day of the current month
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const defaultEndDate = `${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`;

    // Try querying the expenses table directly first
    let query = supabase
      .from("expenses")
      .select("*")
      .gte("expense_date", startDate || defaultStartDate)
      .lte("expense_date", endDate || defaultEndDate);

    // Apply branch filter if provided
    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalAmount =
      data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

    return {
      data: totalAmount,
      error: null,
    };
  } catch (error) {
    console.error("getMonthlyExpense", error);
    return {
      data: 0,
      error,
    };
  }
};
