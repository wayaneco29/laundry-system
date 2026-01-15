"use server";

import { unstable_cache } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

export const getOrders = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const supabase = await createClient();
    const fetchOrders = unstable_cache(
      async () => {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;
        let query = supabase
          .from("view_orders")
          .select("*", { count: "exact" });

        // Apply filters
        if (options?.search) {
          query = query.or(
            `customer_name.ilike.%${options.search}%,order_id.ilike.%${options.search}%`
          );
        }
        if (options?.status) {
          query = query.eq("order_status", options.status);
        }
        if (options?.branchId) {
          query = query.eq("branch_id", options.branchId);
        }
        if (options?.startDate) {
          query = query.gte("created_at", options.startDate);
        }
        if (options?.endDate) {
          query = query.lte("created_at", options.endDate);
        }

        // Apply pagination
        query = query
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        console.log(data, error);
        if (error) throw error?.message;

        return { data, error: null, count };
      },
      ["getOrders", JSON.stringify(options)],
      { tags: ["getOrders"] }
    );

    const res = await fetchOrders();

    return res;
  } catch (_error) {
    return { data: null, error: _error, count: 0 };
  }
};
