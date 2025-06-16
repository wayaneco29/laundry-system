"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getRecurringExpensesDue = async (daysAhead: number = 7) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("get_recurring_expenses_due", {
      p_days_ahead: daysAhead,
    });

    if (error) throw error;

    return {
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("getRecurringExpensesDue", error);
    return {
      data: [],
      error,
    };
  }
};