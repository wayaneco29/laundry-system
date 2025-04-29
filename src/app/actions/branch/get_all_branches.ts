"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getAllBranches = async () => {
  const supabase = await createClient();

  const fetchBranches = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("view_branches")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return data;
    },
    ["getAllBranches"],
    { revalidate: 60, tags: ["getAllBranches"] }
  );

  try {
    const data = await fetchBranches();

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("getAllBranches", error);
    return {
      data: [],
      error,
    };
  }
};
