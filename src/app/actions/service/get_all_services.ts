"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getAllServices = async () => {
  const supabase = await createClient();

  const fetchServices = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("view_services")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return data;
    },
    ["getAllServices"],
    { revalidate: 60, tags: ["getAllServices"] }
  );

  try {
    const data = await fetchServices();

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("getAllServices", error);
    return {
      data: [],
      error,
    };
  }
};
