"use server";

import { ROLE_ADMIN } from "@/app/types";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface Branch {
  id: string;
  name: string;
  description?: string;
  address?: string;
}

export interface CheckUsernameResult {
  isAdmin: boolean;
  branches: Branch[];
  email: string;
}

export async function checkUsername(username: string): Promise<{
  data: CheckUsernameResult | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("view_app_users")
      .select("email, role_name, branches")
      .eq("username", username)
      .single();

    if (error || !data?.email) {
      return {
        data: null,
        error: `Unable to find username "${username}"`,
      };
    }

    const isAdmin = data.role_name === ROLE_ADMIN;
    const branches: Branch[] = (data.branches || []).filter(
      (b: Branch | null) => b !== null
    );

    return {
      data: {
        isAdmin,
        branches,
        email: data.email,
      },
      error: null,
    };
  } catch (_error) {
    console.error(_error);
    return {
      data: null,
      error: "Something went wrong while checking username",
    };
  }
}

export async function loginUser({
  username,
  password,
  branchId,
  rememberMe = true,
}: {
  username: string;
  password: string;
  branchId?: string;
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

      // Store the selected branch ID in a cookie for staff members
      if (branchId) {
        const cookieStore = await cookies();
        cookieStore.set("selected_branch_id", branchId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 24 hours
          path: "/",
        });
      }
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

/**
 * Get the selected branch ID from the cookie (set during login)
 */
export async function getSelectedBranchId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("selected_branch_id")?.value || null;
}

/**
 * Clear the selected branch ID cookie
 */
export async function clearSelectedBranchId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("selected_branch_id");
}

export async function logoutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  // Clear the selected branch cookie on logout
  await clearSelectedBranchId();

  redirect("/login");
}
