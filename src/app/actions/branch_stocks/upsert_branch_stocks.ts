"use server";

import { createClient } from "@/app/utils/supabase/server";
import moment from "moment";
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
    // Update the branch_stocks JSONB field
    const { data, error } = await supabase
      .from("branches")
      .update({
        branch_stocks: JSON.stringify(payload.stocks),
        updated_at: moment().toISOString(),
      })
      .eq("id", payload.branchId)
      .select();

    if (error) throw error;

    revalidateTag("getAllBranches");
    revalidateTag("getBranch");

    return { success: true, data, message: "Inventory updated successfully" };
  } catch (error: any) {
    console.error("Error updating branch stocks:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to update inventory",
    };
  }
};
