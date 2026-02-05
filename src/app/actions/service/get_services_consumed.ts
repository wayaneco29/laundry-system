"use server";

import { createClient } from "@/app/utils/supabase/server";

export type ServiceConsumedData = {
  service_id: string;
  service_name: string;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
};

export const getServicesConsumed = async (options?: {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}) => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("sales")
      .select("order_id, total_price, items, branch_id, created_at");

    // Apply date range filter if provided
    if (options?.startDate) {
      query = query.gte("created_at", `${options.startDate}T00:00:00`);
    }
    if (options?.endDate) {
      query = query.lte("created_at", `${options.endDate}T23:59:59`);
    }
    // Apply branch filter if provided
    if (options?.branchId) {
      query = query.eq("branch_id", options.branchId);
    }

    const { data: sales, error } = await query;

    if (error) throw error;

    // Group by service id and calculate totals
    const serviceMap: Map<string, ServiceConsumedData> = new Map();

    sales?.forEach((sale: any) => {
      // Process items if they exist
      if (Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          const serviceId = item.id;
          if (!serviceId) return;

          const serviceName = item.name || "Unknown Service";
          const quantity = Number(item.quantity) || 0;
          const total = Number(item.total || 0);

          if (!serviceMap.has(serviceId)) {
            serviceMap.set(serviceId, {
              service_id: serviceId,
              service_name: serviceName,
              category_name: "N/A",
              total_orders: 0,
              total_quantity: 0,
              total_revenue: 0,
            });
          }

          const data = serviceMap.get(serviceId)!;
          data.total_orders += 1;
          data.total_quantity += quantity;
          data.total_revenue += total;
        });
      }
    });

    // Convert map to array and sort by total orders (descending)
    const result = Array.from(serviceMap.values()).sort(
      (a, b) => b.total_orders - a.total_orders
    );

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error("getServicesConsumed", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      data: [],
      error: errorMessage,
    };
  }
};

export const getServicesSummary = async (options?: {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}) => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("sales")
      .select("order_id, total_price, items, branch_id, created_at");

    // Apply date range filter if provided
    if (options?.startDate) {
      query = query.gte("created_at", `${options.startDate}T00:00:00`);
    }
    if (options?.endDate) {
      query = query.lte("created_at", `${options.endDate}T23:59:59`);
    }
    // Apply branch filter if provided
    if (options?.branchId) {
      query = query.eq("branch_id", options.branchId);
    }

    const { data: sales, error } = await query;

    if (error) throw error;

    let totalServices = 0;
    let totalRevenue = 0;
    const uniqueServiceIds = new Set<string>();

    sales?.forEach((sale: any) => {
      // Process items if they exist
      if (Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          const serviceId = item.id;
          if (!serviceId) return;

          const total = Number(item.total || 0);
          totalRevenue += total;
          uniqueServiceIds.add(serviceId);
        });
      }
    });

    return {
      data: {
        total_services_consumed: uniqueServiceIds.size, // Count of unique services used
        total_revenue: totalRevenue,
        unique_services_offered: uniqueServiceIds.size,
      },
      error: null,
    };
  } catch (error) {
    console.error("getServicesSummary", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      data: {
        total_services_consumed: 0,
        total_revenue: 0,
        unique_services_offered: 0,
      },
      error: errorMessage,
    };
  }
};
