"use server";

import { createClient } from "@/app/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export const getAllBranchStocks = async (params: {
  page?: number;
  limit?: number;
  branchId?: string;
  search?: string;
}) => {
  noStore();
  const supabase = await createClient();
  try {
    let query = supabase
      .from("view_branch_stocks")
      .select("*", { count: "exact" });

    if (params?.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    if (params?.search) {
      query = query.ilike("stock_name", `%${params?.search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return { success: true, data: data, count: count };
  } catch (error: any) {
    console.error("Error fetching branch stocks:", error);
    return { success: false, data: null, message: error.message };
  }
};
