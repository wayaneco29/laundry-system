"use server";

import { createAdminClient } from "@/app/utils/supabase/server";

type UpdateStaffPasswordType = {
  user_id: string;
  new_password: string;
};

export const updateStaffPassword = async (payload: UpdateStaffPasswordType) => {
  const supabase = await createAdminClient();
  try {
    const { error } = await supabase.auth.admin.updateUserById(payload.user_id, {
      password: payload.new_password,
    });

    if (error) throw error;

    // Also update the password in app_users table
    const { error: appUserError } = await supabase
      .from("app_users")
      .update({ password: payload.new_password })
      .eq("user_id", payload.user_id);

    if (appUserError) throw appUserError;

    return { data: { success: true }, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
