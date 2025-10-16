"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getAllExpenses = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
}) => {
  const supabase = await createClient();
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  console.log({ options });

  const fetchExpenses = unstable_cache(
    async () => {
      let query = supabase
        .from("view_expenses")
        .select("*", { count: "exact" });

      // Apply filters
      if (options?.search) {
        query = query.or(
          `description.ilike.%${options.search}%,vendor.ilike.%${options.search}%`
        );
      }
      if (options?.startDate) {
        try {
          query = query.gte("expense_date", options.startDate);
        } catch (error) {
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

      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    },
    ["getAllExpenses", JSON.stringify(options)],
    { revalidate: 60, tags: ["getAllExpenses"] }
  );

  try {
    const result = await fetchExpenses();

    return {
      data: result.data,
      error: result.error,
      count: result.count || 0,
    };
  } catch (error) {
    console.error("getAllExpenses", error);
    return {
      data: [],
      error,
      count: 0,
    };
  }
};
