"use server";

import { createClient } from "@/app/utils/supabase/server";

type GetExpenseStatsType = {
  startDate?: string;
  endDate?: string;
  branchId?: string;
};

export const getExpenseStats = async (filters: GetExpenseStatsType = {}) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("get_expense_stats", {
      p_start_date: filters.startDate || null,
      p_end_date: filters.endDate || null,
      p_branch_id: filters.branchId || null,
    });

    if (error) throw error;

    return {
      data: data?.[0] || null,
      error: null,
    };
  } catch (error) {
    console.error("getExpenseStats", error);
    return {
      data: null,
      error,
    };
  }
};