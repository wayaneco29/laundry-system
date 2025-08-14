"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

type TUpdatePaymentStatus = {
  p_order_id: string;
  p_payment_status: string;
  p_staff_id: string;
};

export const updatePaymentStatus = async (payload: TUpdatePaymentStatus) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "update_payment_status",
      payload
    );

    if (error) throw error?.message;

    revalidatePath(`/orders/${payload?.p_order_id}`);

    return { data, error: null };
  } catch (_error) {
    return { data: null, error: _error };
  }
};
