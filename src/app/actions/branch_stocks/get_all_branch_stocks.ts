"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getAllBranchStocks = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
}) => {
  try {
    const supabase = await createClient();
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const fetchStocks = unstable_cache(
      async () => {
        let query = supabase.from("branches").select("*", { count: "exact" });

        if (options?.branchId) {
          query = query.eq("branch_id", options.branchId);
        }

        query = query
          .order("name", { ascending: true })
          .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return { data, error: null, count };
      },
      ["getAllBranchStocks", JSON.stringify(options)],
      { tags: ["getAllBranchStocks"] }
    );

    const res = await fetchStocks();

    return res;
  } catch (_error) {
    return { data: null, error: _error, count: 0 };
  }
};
