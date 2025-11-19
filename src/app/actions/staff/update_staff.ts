"use server";

import { revalidateTag } from "next/cache";

import { createAdminClient } from "@/app/utils/supabase/server";

type UpdateStaffType = {
  p_staff_id: string;
  p_first_name: string;
  p_middle_name?: string;
  p_last_name: string;
  p_phone: string;
  p_address: string;
  p_branch_ids: string[];
  p_updated_by: string;
};

export const updateStaff = async (payload: UpdateStaffType) => {
  const supabase = await createAdminClient();
  try {
    // Update staffs table with basic information only
    const { error: staffError } = await supabase
      .from("staffs")
      .update({
        first_name: payload.p_first_name,
        middle_name: payload.p_middle_name,
        last_name: payload.p_last_name,
        phone: payload.p_phone,
        address: payload.p_address,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", payload.p_staff_id);

    if (staffError) throw staffError;

    // Get existing app_users data (username, role, etc.)
    const { data: existingUser } = await supabase
      .from("app_users")
      .select("username, email, password, role_id")
      .eq("user_id", payload.p_staff_id)
      .limit(1)
      .single();

    // Delete ALL existing app_users records for this staff
    const { error: deleteError } = await supabase
      .from("app_users")
      .delete()
      .eq("user_id", payload.p_staff_id);

    if (deleteError) throw deleteError;

    // Insert NEW app_users rows - one per branch
    const appUsersRows = payload.p_branch_ids.map((branchId) => ({
      user_id: payload.p_staff_id,
      username: existingUser?.username,
      email: existingUser?.email,
      password: existingUser?.password,
      role_id: existingUser?.role_id,
      branch_id: branchId,
      updated_by: payload.p_updated_by,
      updated_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("app_users")
      .insert(appUsersRows);

    if (insertError) throw insertError;

    revalidateTag("getAllStaffs");

    return { data: { user_id: payload.p_staff_id }, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
