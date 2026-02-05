"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getYearlyExpense = async (
  branchId?: string,
  startDate?: string,
  endDate?: string
) => {
  const supabase = await createClient();

  try {
    const currentYear = new Date().getFullYear();
    const defaultStartDate = `${currentYear}-01-01`;
    const defaultEndDate = `${currentYear}-12-31`;

    let query = supabase
      .from("expenses")
      .select("amount")
      .gte("expense_date", startDate || defaultStartDate)
      .lte("expense_date", endDate || defaultEndDate);

    // Apply branch filter if provided
    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalAmount = data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

    return {
      data: totalAmount,
      error: null,
    };
  } catch (error) {
    console.error("getYearlyExpense", error);
    return {
      data: 0,
      error,
    };
  }
};