"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getAllCustomers = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const supabase = await createClient();
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const offset = (page - 1) * limit;

  const fetchCustomers = unstable_cache(
    async () => {
      let query = supabase
        .from("view_customers")
        .select("*", { count: "exact" });

      // Apply search filter
      if (options?.search) {
        query = query.or(
          `first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,phone.ilike.%${options.search}%`
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
    ["getAllCustomers", JSON.stringify(options)],
    { revalidate: 60, tags: ["getAllCustomers"] }
  );

  try {
    const result = await fetchCustomers();

    return {
      data: result.data,
      error: result.error,
      count: result.count || 0,
    };
  } catch (error) {
    console.error("getAllCustomers", error);
    return {
      data: [],
      error,
      count: 0,
    };
  }
};
