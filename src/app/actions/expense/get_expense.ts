"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getExpense = async (expenseId: string) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("view_expenses")
      .select("*")
      .eq("id", expenseId)
      .single();

    if (error) throw error;

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("getExpense", error);
    return {
      data: null,
      error,
    };
  }
};