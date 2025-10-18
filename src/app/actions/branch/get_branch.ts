"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getBranchInfo = async (branch_id: string) => {
  try {
    const supabase = await createClient();

    const fetchBranch = unstable_cache(
      async () => {
        const [branch_resp, stocks_resp] = await Promise.all([
          await supabase
            .from("view_branches")
            .select("*")
            .eq("id", branch_id)
            .single(),
          await supabase
            .from("view_branch_stocks")
            .select("*")
            .eq("branch_id", branch_id)
            .order("created_at", {
              ascending: false,
            }),
        ]);

        if (branch_resp?.error || stocks_resp?.error) {
          throw branch_resp?.error || stocks_resp?.error;
        }

        return {
          data: {
            id: branch_resp?.data?.id || branch_id,
            name: branch_resp?.data?.name,
            description: branch_resp?.data?.description,
            address: branch_resp?.data?.address,
            stocks: stocks_resp?.data,
          },
          error: null,
        };
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
