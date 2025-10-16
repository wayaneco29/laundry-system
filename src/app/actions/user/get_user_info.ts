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

    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
