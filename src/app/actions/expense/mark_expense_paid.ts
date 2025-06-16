"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const markExpensePaid = async (expenseId: string, updatedBy: string) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("mark_expense_paid", {
      p_expense_id: expenseId,
      p_updated_by: updatedBy,
    });

    if (error) throw error;

    // Revalidate the cache
    revalidateTag("getAllExpenses");

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("markExpensePaid", error);
    return {
      data: null,
      error,
    };
  }
};