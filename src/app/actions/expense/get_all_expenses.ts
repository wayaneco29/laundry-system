"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getAllExpenses = async (options?: {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}) => {
  const supabase = await createClient();

  const fetchExpenses = unstable_cache(
    async () => {
      let query = supabase
        .from("view_expenses")
        .select("*");

      // Apply date filters if provided - try different possible date column names
      if (options?.startDate) {
        try {
          query = query.gte("expense_date", options.startDate);
        } catch (error) {
          // Try alternative date column names
          try {
            query = query.gte("created_at", options.startDate);
          } catch (fallbackError) {
            console.warn("No suitable date column found for filtering");
          }
        }
      }
      if (options?.endDate) {
        try {
          query = query.lte("expense_date", options.endDate);
        } catch (error) {
          // Try alternative date column names
          try {
            query = query.lte("created_at", options.endDate);
          } catch (fallbackError) {
            console.warn("No suitable date column found for filtering");
          }
        }
      }
      if (options?.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data;
    },
    ["getAllExpenses", options?.startDate || "", options?.endDate || "", options?.branchId || ""],
    { revalidate: 60, tags: ["getAllExpenses"] }
  );

  try {
    const data = await fetchExpenses();

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("getAllExpenses", error);
    return {
      data: [],
      error,
    };
  }
};