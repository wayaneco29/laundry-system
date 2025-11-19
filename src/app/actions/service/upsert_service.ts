"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";

type UpsertServiceType = {
  p_service_id: string | null;
  p_name: string;
  p_price: string;
  p_status: string;
  p_staff_id: string;
};

export const upsertService = async (payload: UpsertServiceType) => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("upsert_service", payload);

    if (error) throw error;

    revalidateTag("getAllServices");

    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
