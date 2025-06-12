"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";

type UpsertBranchStocksType = {
  p_stock_id: string | null;
  p_name: string;
  p_quantity: number;
  p_branch_id: string;
  p_created_by: string;
};

export const upsertBranchStocks = async (payload: UpsertBranchStocksType) => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("upsert_branch_stocks", payload);

    if (error) throw error;

    revalidateTag("getAllBranches");
    revalidateTag("getBranch");

    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
