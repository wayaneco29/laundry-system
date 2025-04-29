"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getAllPromos = async () => {
  const supabase = await createClient();

  const fetchPromos = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("view_promos")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return data;
    },
    ["getAllPromos"],
    { revalidate: 60, tags: ["getAllPromos"] }
  );

  try {
    const data = await fetchPromos();
    console.log(data);

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("getAllPromos", error);
    return {
      data: [],
      error,
    };
  }
};
