"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getAllServices = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
}) => {
  const supabase = await createClient();
  const page = options?.page || 1;
  const limit = options?.limit || 15;
  const offset = (page - 1) * limit;

  const fetchServices = unstable_cache(
    async () => {
      let query = supabase
        .from("view_services")
        .select("*", { count: "exact" });

      // Apply search filter
      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%`);
      }

      if (options?.branchId) {
        query = query.eq("branch_id", options.branchId);
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
    ["getAllServices", JSON.stringify(options)],
    { revalidate: 60, tags: ["getAllServices"] }
  );

  try {
    const result = await fetchServices();

    return {
      data: result.data,
      error: result.error,
      count: result.count || 0,
    };
  } catch (error) {
    console.error("getAllServices", error);
    return {
      data: [],
      error,
      count: 0,
    };
  }
};
