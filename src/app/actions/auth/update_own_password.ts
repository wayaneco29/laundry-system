"use server";

import { createClient } from "@/app/utils/supabase/server";
import { encryptPassword } from "@/app/utils/password";

type UpdateOwnPasswordType = {
  current_password: string;
  new_password: string;
};

export const updateOwnPassword = async (payload: UpdateOwnPasswordType) => {
  const supabase = await createClient();
  try {
    // First verify current password by trying to sign in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email || !user?.id) {
      throw new Error("User not found");
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: payload.current_password,
    });

    if (signInError) {
      throw new Error("Current password is incorrect");
    }

    // Update to new password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: payload.new_password,
    });

    if (updateError) throw updateError;

    // Encrypt the password before storing in app_users table (reversible for admin viewing)
    const encryptedPassword = encryptPassword(payload.new_password);

    // Update the encrypted password in app_users table
    const { error: appUserError } = await supabase
      .from("app_users")
      .update({ password: encryptedPassword })
      .eq("user_id", user.id);

    if (appUserError) throw appUserError;

    return { data: { success: true }, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error instanceof Error ? _error.message : "Failed to update password",
    };
  }
};
