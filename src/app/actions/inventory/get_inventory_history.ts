"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getInventoryHistory = async (options?: {
  page?: number;
  limit?: number;
  stockId?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const supabase = await createClient();
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const fetchHistory = unstable_cache(
    async () => {
      let query = supabase
        .from("view_inventory_history")
        .select("*", { count: "exact" });

      if (options?.stockId) {
        query = query.eq("stock_id", options.stockId);
      }
      if (options?.branchId) {
        query = query.eq("branch_id", options.branchId);
      }
      if (options?.startDate) {
        query = query.gte("created_at", options.startDate);
      }
      if (options?.endDate) {
        query = query.lte("created_at", options.endDate);
      }

      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      return { data, error: null, count };
    },
    ["getInventoryHistory", JSON.stringify(options)],
    { revalidate: 60, tags: ["getInventoryHistory"] }
  );

  try {
    const result = await fetchHistory();
    return {
      data: result.data,
      error: result.error,
      count: result.count || 0,
    };
  } catch (error) {
    return {
      data: [],
      error,
      count: 0,
    };
  }
};
