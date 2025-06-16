"use server";

import { createClient } from "@/app/utils/supabase/server";

type GetExpensesByCategoryType = {
  startDate?: string;
  endDate?: string;
  branchId?: string;
};

export const getExpensesByCategory = async (filters: GetExpensesByCategoryType = {}) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("get_expenses_by_category", {
      p_start_date: filters.startDate || null,
      p_end_date: filters.endDate || null,
      p_branch_id: filters.branchId || null,
    });

    if (error) throw error;

    return {
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("getExpensesByCategory", error);
    return {
      data: [],
      error,
    };
  }
};