"use server";

import { unstable_cache } from "next/cache";

import { createClient } from "@/app/utils/supabase/server";

export const getAllBranches = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const supabase = await createClient();
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const offset = (page - 1) * limit;

  const fetchBranches = unstable_cache(
    async () => {
      let query = supabase
        .from("view_branches")
        .select("*", { count: "exact" });

      // Apply search filter
      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,description.ilike.%${options.search}%,address.ilike.%${options.search}%`
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
    ["getAllBranches", JSON.stringify(options)],
    { revalidate: 60, tags: ["getAllBranches"] }
  );

  try {
    const result = await fetchBranches();

    return {
      data: result.data,
      error: result.error,
      count: result.count || 0,
    };
  } catch (error) {
    console.error("getAllBranches", error);
    return {
      data: [],
      error,
      count: 0,
    };
  }
};
