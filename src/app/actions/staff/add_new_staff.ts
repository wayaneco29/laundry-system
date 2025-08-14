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
  p_branch_id: string;
  p_role_id: string;
};

export const addNewStaff = async (payload: AddNewStaffType) => {
  const supabase = await createAdminClient();
  try {
    const { data: user, error: userError } =
      await supabase.auth.admin.createUser({
        email: payload.p_email,
        password: payload?.p_password,
        email_confirm: true,
      });

    if (userError) throw userError?.message;

    const { data, error } = await supabase.rpc("add_new_staff", {
      ...payload,
      p_staff_id: user?.user?.id,
    });

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
