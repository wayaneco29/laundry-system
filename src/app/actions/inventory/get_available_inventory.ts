"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getAvailableInventory = async (branchId: string) => {
  const supabase = await createClient();
  try {
    // Get all stocks with their branch quantities
    const { data: stocksData, error } = await supabase
      .from("view_branch_stocks")
      .select("*")
      .eq("branch_id", branchId)
      .gt("quantity", 0) // Only show items with stock available
      .order("stock_name");

    if (error) throw error;

    // Transform data for easier use in forms
    const inventoryItems = stocksData?.map((item: any) => ({
      id: item.stock_id,
      name: item.stock_name,
      availableQuantity: item.quantity,
      branchId: item.branch_id,
      branchName: item.branch_name,
    })) || [];

    return { success: true, data: inventoryItems };
  } catch (error: any) {
    console.error("Error fetching available inventory:", error);
    return { success: false, data: [], message: error.message };
  }
};