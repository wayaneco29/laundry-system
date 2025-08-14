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
};

export const addOrder = async (payload: AddOrderPayload) => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("add_customer_order", payload);

    if (error) throw error?.message;

    revalidateTag("getOrders");

    return {
      data,
      error: null,
    };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
