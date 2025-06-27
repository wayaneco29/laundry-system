"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";

type UpsertBranchStocksType = {
  branchId: string;
  stocks: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
};

export const upsertBranchStocks = async (payload: UpsertBranchStocksType) => {
  const supabase = await createClient();
  try {
    const stocksToUpsert = payload.stocks.map((stock) => ({
      branch_id: payload.branchId,
      id: stock.id,
      name: stock.name,
      quantity: stock.quantity,
    }));

    console.log(stocksToUpsert);
    const { data, error } = await supabase
      .from("stocks")
      .upsert(stocksToUpsert, { onConflict: "branch_id, id" })
      .select();

    if (error) throw error;

    revalidateTag("getAllBranches");
    revalidateTag("getBranch");
    revalidateTag("getAllBranchStocks");

    return { success: true, data, message: "Inventory updated successfully" };
  } catch (error: any) {
    console.error("Error upserting branch stocks:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to update inventory",
    };
  }
};
