"use server";

import { ROLE_ADMIN } from "@/app/types";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginUser({
  username,
  password,
}: {
  username: string;
  password: string;
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

    const { error } = await supabase.auth.signInWithPassword({
      email: data?.email,
      password,
    });

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
