"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";

type TUpdateOrderStatus = {
  p_order_id: string;
  p_order_status: string;
  p_staff_id: string;
};

export const updateOrderStatus = async (payload: TUpdateOrderStatus) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("update_order_status", payload);

    if (error) throw error?.message;

    revalidateTag("getOrders");

    return { data, error: null };
  } catch (_error) {
    return { data: null, error: _error };
  }
};
