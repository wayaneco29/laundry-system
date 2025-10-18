"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { addNewStock } from "../inventory";

type UpsertBranchStocksType = {
  stockId?: string;
  branchId: string;
  stockName: string;
  quantity: number;
  staff_id: string;
};

export const upsertBranchStocks = async (payload: UpsertBranchStocksType) => {
  try {
    const { data, success } = await addNewStock(payload);

    if (!success) throw "Failed to save";

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
