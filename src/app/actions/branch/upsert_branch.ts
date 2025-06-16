"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";

type UpsertBranchType = {
  p_branch_id: string | null;
  p_name: string;
  p_description: string;
  p_address: string;
  p_staff_id: string;
};

export const upsertBranch = async (payload: UpsertBranchType) => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("upsert_branch", payload);

    if (error) throw error;

    revalidateTag("getAllBranches");
    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
