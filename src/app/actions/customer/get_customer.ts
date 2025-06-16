"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getCustomer = async (customerId: string) => {
  try {
    const supabase = await createClient();

    const fetchCustomer = unstable_cache(
      async () => {
        const { data, error } = await supabase
          .from("view_customers")
          .select("*")
          .eq("customer_id", customerId)
          .single();

        return { data, error };
      },
      ["getCustomer"],
      { revalidate: 60, tags: ["getCustomer"] }
    );

    const { data, error } = await fetchCustomer();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("getCustomer", error);
    return {
      data: null,
      error,
    };
  }
};
