"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getAllCustomers = async () => {
  const supabase = await createClient();

  const fetchCustomers = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("view_customers")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return data;
    },
    ["getAllCustomers"],
    { revalidate: 60, tags: ["getAllCustomers"] }
  );

  try {
    const data = await fetchCustomers();

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("getAllCustomers", error);
    return {
      data: [],
      error,
    };
  }
};
