"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getAllStaffs = async () => {
  const supabase = await createClient();

  const fetchStaffs = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("view_staffs")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return data;
    },
    ["getAllStaffs"],
    { revalidate: 60, tags: ["getAllStaffs"] }
  );

  try {
    const data = await fetchStaffs();

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("getAllStaffs", error);
    return {
      data: [],
      error,
    };
  }
};
