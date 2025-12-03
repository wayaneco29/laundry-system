"use server";

import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/app/utils/supabase/server";
import { encryptPassword } from "@/app/utils/password";

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

    // Encrypt the password before storing in app_users table (reversible for admin viewing)
    const encryptedPassword = encryptPassword(payload.new_password);

    // Update the encrypted password in app_users table
    const { error: appUserError } = await supabase
      .from("app_users")
      .update({ password: encryptedPassword })
      .eq("user_id", payload.user_id);

    if (appUserError) throw appUserError;

    revalidateTag("getAllStaffs");

    return { data: { success: true }, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
