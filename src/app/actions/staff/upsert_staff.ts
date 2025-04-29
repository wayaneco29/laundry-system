"use server";

import { revalidateTag } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

type UpsertStaffType = {
  p_staff_id: string | null;
  p_branch_id: string;
  p_first_name: string;
  p_middle_name?: string;
  p_last_name: string;
  p_phone: string;
  p_email?: string;
  p_address: string;
  p_created_by: string;
};

export const upsertStaff = async (payload: UpsertStaffType) => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("upsert_staff", payload);

    console.log(data, error);
    if (error) throw error;

    revalidateTag("getAllStaffs");

    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
