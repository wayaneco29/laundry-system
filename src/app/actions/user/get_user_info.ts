"use server";

import { createClient } from "@/app/utils/supabase/server";

export const getUserInfo = async () => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("view_app_users")
      .select()
      .eq("user_id", user?.id)
      .single();

    // Transform branches array to branch_ids and branch_names arrays
    if (data && data.branches) {
      const branches = Array.isArray(data.branches) ? data.branches : [];
      data.branch_ids = branches.map((branch: any) => branch.id);
      data.branch_names = branches.map((branch: any) => branch.name);
    } else {
      data.branch_ids = [];
      data.branch_names = [];
    }

    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
