"use server";

import { createClient } from "@/app/utils/supabase/server";

export async function getAllRoles() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("roles").select("id, name");
    if (error) throw error;
    return {
      data: data || [],
      error: null,
    };
  } catch (_error) {
    return {
      data: [],
      error: _error,
    };
  }
}
