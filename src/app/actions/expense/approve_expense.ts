"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

type ApproveExpenseType = {
  expenseId: string;
  approvedBy: string;
  status: 'Approved' | 'Rejected';
};

export const approveExpense = async (approvalData: ApproveExpenseType) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("approve_expense", {
      p_expense_id: approvalData.expenseId,
      p_approved_by: approvalData.approvedBy,
      p_status: approvalData.status,
    });

    if (error) throw error;

    // Revalidate the cache
    revalidateTag("getAllExpenses");

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("approveExpense", error);
    return {
      data: null,
      error,
    };
  }
};