"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";

type UpsertCustomerType = {
  p_customer_id: string | null;
  p_first_name: string;
  p_middle_name?: string;
  p_last_name: string;
  p_phone: string;
  p_email: any;
  p_address: string;
  p_staff_id: string;
};

export const upsertCustomer = async (payload: UpsertCustomerType) => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("upsert_customer", payload);

    if (error) throw error;

    revalidateTag("getAllCustomers");

    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
