"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getAllPromos = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const supabase = await createClient();
  const page = options?.page || 1;
  const limit = options?.limit || 15;
  const offset = (page - 1) * limit;

  const fetchPromos = unstable_cache(
    async () => {
      let query = supabase.from("view_promos").select("*", { count: "exact" });

      // Apply filters
      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,code.ilike.%${options.search}%,description.ilike.%${options.search}%`
        );
      }
      if (options?.status) {
        query = query.eq("status", options.status);
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
    ["getAllPromos", JSON.stringify(options)],
    { revalidate: 60, tags: ["getAllPromos"] }
  );

  try {
    const result = await fetchPromos();

    return {
      data: result.data,
      error: result.error,
      count: result.count || 0,
    };
  } catch (error) {
    console.error("getAllPromos", error);
    return {
      data: [],
      error,
      count: 0,
    };
  }
};
