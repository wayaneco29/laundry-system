"use server";

import { revalidateTag } from "next/cache";

import { createAdminClient } from "@/app/utils/supabase/server";

type AddNewStaffType = {
  p_first_name: string;
  p_middle_name?: string;
  p_last_name: string;
  p_phone: string;
  p_email: string;
  p_address: string;
  p_employment_date: string;
  p_created_by: string;
  p_username: string;
  p_password: string;
  p_branch_ids: string[];
  p_role_id: string;
};

export const addNewStaff = async (payload: AddNewStaffType) => {
  const supabase = await createAdminClient();
  try {
    // Create auth user
    const { data: user, error: userError } =
      await supabase.auth.admin.createUser({
        email: payload.p_email,
        password: payload?.p_password,
        email_confirm: true,
      });

    if (userError) throw userError?.message;

    const userId = user?.user?.id;

    // Insert into staffs table
    const { error: staffError } = await supabase.from("staffs").insert({
      user_id: userId,
      first_name: payload.p_first_name,
      middle_name: payload.p_middle_name,
      last_name: payload.p_last_name,
      phone: payload.p_phone,
      email: payload.p_email,
      address: payload.p_address,
      employment_date: payload.p_employment_date,
      created_by: payload.p_created_by,
    });

    if (staffError) throw staffError;

    // Insert MULTIPLE rows into app_users - one row per branch
    const appUsersRows = payload.p_branch_ids.map((branchId) => ({
      user_id: userId,
      username: payload.p_username,
      email: payload.p_email,
      password: payload.p_password,
      role_id: payload.p_role_id,
      branch_id: branchId,
      created_by: payload.p_created_by,
    }));

    const { error: appUserError } = await supabase
      .from("app_users")
      .insert(appUsersRows);

    if (appUserError) throw appUserError;

    revalidateTag("getAllStaffs");

    return { data: { user_id: userId }, error: null };
  } catch (_error) {
    console.log(_error);
    return {
      data: null,
      error: _error,
    };
  }
};
