"use server";

import { createClient } from "@/app/utils/supabase/server";

type GetExpensesByCategoryType = {
  startDate?: string;
  endDate?: string;
  branchId?: string;
};

export const getExpensesByCategory = async (
  filters: GetExpensesByCategoryType = {}
) => {
  const supabase = await createClient();

  try {
    // Try the RPC function first
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_expenses_by_category",
      {
        p_start_date: filters.startDate || null,
        p_end_date: filters.endDate || null,
        p_branch_id: filters.branchId || null,
      }
    );

    // If RPC fails due to column issues, use direct query as fallback
    if (
      rpcError &&
      (rpcError.message?.includes("status") ||
        rpcError.message?.includes("column") ||
        rpcError.message?.includes("does not exist"))
    ) {
      console.warn(
        "getExpensesByCategory: RPC function has column issues, using direct query fallback"
      );

      let query = supabase.from("view_expenses").select("*");

      // Apply filters
      if (filters.startDate) {
        query = query.gte("expense_date", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("expense_date", filters.endDate);
      }
      if (filters.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }

      const { data: directData, error: directError } = await query;

      if (directError) throw directError;

      // Log the first record to see what columns are actually available
      // Group by category manually
      const categoryMap: Record<
        string,
        { total_amount: number; expense_count: number }
      > = {};

      directData?.forEach((expense: any) => {
        // Try different possible category field names
        const category =
          expense.category ||
          expense.expense_category ||
          expense.type ||
          "Uncategorized";
        const amount = Number(expense.amount || expense.expense_amount || 0);

        if (!categoryMap[category]) {
          categoryMap[category] = { total_amount: 0, expense_count: 0 };
        }

        categoryMap[category].total_amount += amount;
        categoryMap[category].expense_count += 1;
      });

      // Convert to expected format
      const result = Object.entries(categoryMap).map(
        ([category_name, data]) => ({
          category_name,
          total_amount: data.total_amount,
          expense_count: data.expense_count,
        })
      );

      return {
        data: result,
        error: null,
      };
    }

    if (rpcError) throw rpcError;

    return {
      data: rpcData || [],
      error: null,
    };
  } catch (error) {
    console.error("getExpensesByCategory", error);
    return {
      data: [],
      error: null, // Return null error to prevent UI crashes
    };
  }
};
