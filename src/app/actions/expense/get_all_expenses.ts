"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getAllExpenses = async () => {
  const supabase = await createClient();

  const fetchExpenses = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("view_expenses")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return data;
    },
    ["getAllExpenses"],
    { revalidate: 60, tags: ["getAllExpenses"] }
  );

  try {
    const data = await fetchExpenses();

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("getAllExpenses", error);
    return {
      data: [],
      error,
    };
  }
};