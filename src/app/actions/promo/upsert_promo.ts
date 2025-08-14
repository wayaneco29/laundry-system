"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

type UpsertPromoType = {
  p_promo_id: string | null;
  p_name: string;
  p_code: string;
  p_description: string;
  p_valid_until: string;
  p_status: string;
  p_staff_id: string;
};

export const upsertPromo = async (payload: UpsertPromoType) => {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc("upsert_promo", payload);

    if (error) throw error;

    revalidatePath("/promos");

    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: _error,
    };
  }
};
