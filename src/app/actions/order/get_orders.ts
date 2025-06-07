"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getOrders = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("view_orders").select("*");

    if (error) throw error?.message;

    return { data, error: null };
  } catch (_error) {
    return { data: null, error: _error };
  }
};
