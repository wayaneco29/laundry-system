"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

type AddStocksType = {
  branchId: string;
  stockName: string;
  quantity: number;
  staff_id: string;
};
// Using the simple function that returns only stock_id
export const addNewStock = async (payload: AddStocksType) => {
  const supabase = await createClient();

  try {
    const { data: stockId, error } = await supabase.rpc(
      "add_stock_and_branch_stock",
      {
        p_stock_name: payload?.stockName,
        p_branch_id: payload?.branchId,
        p_quantity: payload?.quantity,
        p_staff_id: payload?.staff_id,
      }
    );

    if (error) throw error;

    revalidatePath("/inventory");

    return {
      success: true,
      data: { stock_id: stockId },
      message: "Stock added successfully",
    };
  } catch (error: any) {
    console.error("Error adding stock:", error);
    return {
      success: false,
      data: null,
      message: error.message || "Failed to add stock",
    };
  }
};
