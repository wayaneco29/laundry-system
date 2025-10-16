"use server";

import { createClient } from "@/app/utils/supabase/server";
import moment from "moment";

export type TopServiceItem = {
  name: string;
  count: number;
  totalAmount: number;
};

export type DailySalesData = {
  totalSales: number;
  servicesAmount: number;
  itemsAmount: number;
  ordersCount: number;
  servicesCount: number;
  itemsCount: number;
  topServices: TopServiceItem[];
  topItems: TopServiceItem[];
};

export async function getDailySales(
  date: Date,
  branchId?: string
): Promise<{ data: DailySalesData | null; error: string | null }> {
  const supabase = await createClient();

  try {
    // Format date for querying (start and end of day)
    // const dayStart = new Date(date);
    // dayStart.setHours(0, 0, 0, 0);
    // const dayEnd = new Date(date);
    // dayEnd.setHours(23, 59, 59, 999);

    const today = new Date();

    const dayStart =
      (date || new Date(today.getFullYear(), today.getMonth(), 1))
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";
    const dayEnd =
      moment(
        date ||
          new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      )
        .add("day", 1)
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";
    console.log({ dayStart, dayEnd });
    // const dayStartISO = dayStart.toISOString();
    // const dayEndISO = dayEnd.toISOString();

    // Build query with optional branch filter using view_orders
    let ordersQuery = supabase
      .from("view_orders")
      .select("order_id, total_price, items")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    if (branchId) {
      ordersQuery = ordersQuery.eq("branch_id", branchId);
    }

    const { data: orders, error } = await ordersQuery;

    if (error) throw error;

    let totalSales = 0;
    let servicesAmount = 0;
    let itemsAmount = 0;
    let ordersCount = orders?.length || 0;
    let servicesCount = 0;
    let itemsCount = 0;

    // Track services and items for top lists
    const serviceTracker: Record<string, { count: number; totalAmount: number }> = {};
    const itemTracker: Record<string, { count: number; totalAmount: number }> = {};

    orders?.forEach((order) => {
      totalSales += Number(order.total_price || 0);

      // Process items if they exist
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const itemTotal = item.total || (item.quantity || 0) * (item.price || 0);
          const itemName = item.name || 'Unknown';

          // Distinguish between services and inventory items
          // Services: Wash, Dry, Iron, Press, etc.
          // Items: Detergent, Soap, Fabric Softener, etc.
          const serviceKeywords = ['wash', 'dry', 'iron', 'press', 'fold', 'clean'];
          const itemKeywords = ['detergent', 'soap', 'softener', 'bleach', 'starch'];

          const isService = serviceKeywords.some(keyword => 
            itemName.toLowerCase().includes(keyword)
          );
          const isInventoryItem = itemKeywords.some(keyword => 
            itemName.toLowerCase().includes(keyword)
          );

          if (isService || (!isService && !isInventoryItem)) {
            // Default to service if not clearly an inventory item
            servicesAmount += itemTotal;
            servicesCount += 1; // Count services, not quantity

            // Track for top services
            if (!serviceTracker[itemName]) {
              serviceTracker[itemName] = { count: 0, totalAmount: 0 };
            }
            serviceTracker[itemName].count += 1;
            serviceTracker[itemName].totalAmount += itemTotal;
          } else {
            // It's an inventory item
            itemsAmount += itemTotal;
            itemsCount += 1; // Count items, not quantity

            // Track for top items
            if (!itemTracker[itemName]) {
              itemTracker[itemName] = { count: 0, totalAmount: 0 };
            }
            itemTracker[itemName].count += 1;
            itemTracker[itemName].totalAmount += itemTotal;
          }
        });
      }
    });

    // Convert trackers to sorted arrays
    const topServices: TopServiceItem[] = Object.entries(serviceTracker)
      .map(([name, data]) => ({
        name,
        count: data.count,
        totalAmount: data.totalAmount,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 services

    const topItems: TopServiceItem[] = Object.entries(itemTracker)
      .map(([name, data]) => ({
        name,
        count: data.count,
        totalAmount: data.totalAmount,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 items

    const data: DailySalesData = {
      totalSales,
      servicesAmount,
      itemsAmount,
      ordersCount,
      servicesCount,
      itemsCount,
      topServices,
      topItems,
    };

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
