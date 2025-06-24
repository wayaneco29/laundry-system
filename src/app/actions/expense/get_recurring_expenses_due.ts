"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getRecurringExpensesDue = async (daysAhead: number = 7) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("get_recurring_expenses_due", {
      p_days_ahead: daysAhead,
    });

    if (error) {
      // Handle specific column error gracefully
      if (error.message?.includes('next_due_date') || error.message?.includes('column') || error.message?.includes('does not exist')) {
        console.warn("getRecurringExpensesDue: Database function has column issues, returning empty data");
        return {
          data: [],
          error: null,
        };
      }
      throw error;
    }

    return {
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("getRecurringExpensesDue", error);
    return {
      data: [],
      error: null, // Return null error to prevent UI crashes
    };
  }
};