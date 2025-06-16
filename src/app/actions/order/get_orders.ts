"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getOrders = async () => {
  try {
    const supabase = await createClient();

    const fetchOrders = unstable_cache(
      async () => {
        const { data, error } = await supabase.from("view_orders").select("*");

        if (error) throw error?.message;

        return { data, error: null };
      },
      ["getOrders"],
      {
        tags: ["getOrders"],
      }
    );

    const res = await fetchOrders();

    return res;
  } catch (_error) {
    return { data: null, error: _error };
  }
};
