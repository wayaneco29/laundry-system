"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getBranch = async (branch_id: string) => {
  try {
    const supabase = await createClient();

    const fetchBranch = unstable_cache(
      async () => {
        const { data, error } = await supabase
          .from("view_branches")
          .select("*")
          .eq("id", branch_id)
          .single();

        return { data, error };
      },
      ["getBranch"],
      { revalidate: 60, tags: ["getBranch"] }
    );

    const { data, error } = await fetchBranch();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("getBranch", error);
    return {
      data: null,
      error,
    };
  }
};
