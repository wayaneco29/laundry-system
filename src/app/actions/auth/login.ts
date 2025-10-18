"use server";

import { ROLE_ADMIN } from "@/app/types";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginUser({
  username,
  password,
  rememberMe = true,
}: {
  username: string;
  password: string;
  rememberMe?: boolean;
}) {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("view_app_users")
      .select("email, role_name")
      .eq("username", username)
      .single();

    if (!data?.email)
      throw `Unable to find username ${username} in the auth users.`;

    // Note: Supabase handles session persistence automatically.
    // By default, sessions are stored in localStorage and persist across browser restarts.
    // The rememberMe flag is available for future custom session handling if needed.
    const { error } = await supabase.auth.signInWithPassword({
      email: data?.email,
      password,
    });
    console.log(error);

    if (error) throw error?.message;

    let redirectRoute = "";

    if (data?.role_name === ROLE_ADMIN) {
      redirectRoute = "/dashboard";
    } else {
      redirectRoute = "/orders";
    }

    return { data: redirectRoute, error: null };
  } catch (_error) {
    console.error(_error);

    return {
      data: null,
      error: _error,
    };
  }
}

export async function logoutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}
