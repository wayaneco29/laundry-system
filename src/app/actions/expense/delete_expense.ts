"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const deleteExpense = async (expenseId: string) => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (error) throw error;

    // Revalidate the cache
    revalidateTag("getAllExpenses");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("deleteExpense", error);
    return {
      success: false,
      error,
    };
  }
};