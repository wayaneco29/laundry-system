"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";

type AddOrderPayload = {
  p_branch_id: string;
  p_customer_id: string;
  p_order_status: "Pending" | "Ongoing" | "Ready for Pickup" | "Picked up";
  p_order_date: string;
  p_payment_status: "Paid" | "Unpaid";
  p_total_price: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p_items: Array<any>;
  p_staff_id: string;
  p_mode_of_payment?: "Cash" | "GCash";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p_inventory_usage?: Array<any>;
};

export const addOrder = async (payload: AddOrderPayload) => {
  const supabase = await createClient();
  try {
    console.log("Adding order with payload:", JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.p_customer_id) {
      throw new Error("Customer ID is required");
    }
    if (!payload.p_branch_id) {
      throw new Error("Branch ID is required");
    }
    if (!payload.p_staff_id) {
      throw new Error("Staff ID is required");
    }
    if (!payload.p_items || payload.p_items.length === 0) {
      throw new Error("At least one service item is required");
    }
    if (!payload.p_mode_of_payment) {
      throw new Error("Payment mode is required");
    }

    const { data, error } = await supabase.rpc("add_customer_order", payload);

    if (error) {
      console.error("Database error:", error);
      throw new Error(error.message || "Failed to create order");
    }

    console.log("Order created successfully:", data);
    revalidateTag("getOrders");

    return {
      data,
      error: null,
    };
  } catch (_error) {
    console.error("Error adding order:", _error);
    return {
      data: null,
      error: _error instanceof Error ? _error.message : String(_error),
    };
  }
};
