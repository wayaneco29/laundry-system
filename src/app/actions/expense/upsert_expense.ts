"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

type UpsertExpenseType = {
  p_expense_id?: string | null;
  p_title: string;
  p_description?: string;
  p_amount: number;
  p_category:
    | "Supplies"
    | "Equipment"
    | "Utilities"
    | "Rent"
    | "Salaries"
    | "Marketing"
    | "Maintenance"
    | "Transportation"
    | "Insurance"
    | "Other";
  p_expense_date?: string;
  p_branch_id?: string;
  p_created_by?: string;
};

export const upsertExpense = async (expenseData: UpsertExpenseType) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("upsert_expense", {
      p_title: expenseData.p_title,
      p_amount: expenseData.p_amount,
      p_category: expenseData.p_category,
      p_expense_id: expenseData.p_expense_id || null,
      p_description: expenseData.p_description || null,
      p_expense_date:
        expenseData.p_expense_date || new Date().toISOString().split("T")[0],
      p_branch_id: expenseData.p_branch_id || null,
      p_created_by: expenseData.p_created_by || null,
    });

    if (error) throw error;

    // Revalidate the cache
    revalidatePath("/expenses");

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("upsertExpense", error);
    return {
      data: null,
      error,
    };
  }
};
