"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getOrderById = async ({ id }: { id: string }) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("view_orders")
      .select("*")
      .eq("order_id", id)
      .single();

    if (error) throw error?.message;

    return { data, error: null };
  } catch (_error) {
    return { data: null, error: _error };
  }
};
