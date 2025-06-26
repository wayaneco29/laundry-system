"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getAllStaffs = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const supabase = await createClient();
  const page = options?.page || 1;
  const limit = options?.limit || 15;
  const offset = (page - 1) * limit;

  const fetchStaffs = unstable_cache(
    async () => {
      let query = supabase.from("view_staffs").select("*", { count: "exact" });

      // Apply search filter
      if (options?.search) {
        query = query.or(
          `full_name.ilike.%${options.search}%,phone.ilike.%${options.search}%,email.ilike.%${options.search}%`
        );
      }

      query = query
        .order("created_at", {
          ascending: false,
        })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    },
    ["getAllStaffs", JSON.stringify(options)],
    { revalidate: 60, tags: ["getAllStaffs"] }
  );

  try {
    const result = await fetchStaffs();

    return {
      data: result.data,
      error: result.error,
      count: result.count || 0,
    };
  } catch (error) {
    console.error("getAllStaffs", error);
    return {
      data: [],
      error,
      count: 0,
    };
  }
};
