"use server";

import { ROLE_STAFF } from "@/app/types";
import { createClient } from "@/app/utils/supabase/server";

export async function getRoleStaffID() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("roles")
      .select("id")
      .eq("name", ROLE_STAFF)
      .single();

    if (error) throw error;

    return {
      data: data?.id,
      error: null,
    };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
}
