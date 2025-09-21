"use server";

import { createClient } from "@/app/utils/supabase/server";
import moment from "moment";

export type OrderStatusBreakdown = {
  status: string;
  count: number;
  percentage: number;
};

export type DailyOrderVolume = {
  date: string;
  order_count: number;
  total_amount: number;
  day_name: string;
};

export type OrderPerformanceMetrics = {
  total_orders: number;
  completion_rate: number;
  cancellation_rate: number;
  avg_processing_time: number;
  peak_day: string;
  peak_day_count: number;
};

export type RecentOrder = {
  id: string;
  customer_name: string;
  branch_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export const getOrderStatusBreakdown = async (
  startDate: Date,
  endDate: Date,
  branchId?: string
) => {
  const supabase = await createClient();

  try {
    const today = new Date();
    const monthStart =
      (startDate || new Date(today.getFullYear(), today.getMonth(), 1))
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";
    const monthEnd =
      moment(
        endDate ||
          new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      )
        .add("day", 1)
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";

    let query = supabase
      .from("view_orders")
      .select("order_status")
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd);

    if (branchId && branchId !== "") {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Count orders by status
    const statusCounts: Record<string, number> = {};
    const totalOrders = data?.length || 0;

    data?.forEach((order) => {
      statusCounts[order.order_status] =
        (statusCounts[order.order_status] || 0) + 1;
    });

    // Convert to array with percentages
    const breakdown: OrderStatusBreakdown[] = Object.entries(statusCounts).map(
      ([status, count]) => ({
        status,
        count,
        percentage:
          totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
      })
    );

    return {
      data: breakdown,
      total_orders: totalOrders,
      error: null,
    };
  } catch (error) {
    console.error("getOrderStatusBreakdown", error);
    return {
      data: [],
      total_orders: 0,
      error,
    };
  }
};

export const getDailyOrderVolume = async (
  startDate: Date,
  endDate: Date,
  branchId?: string
) => {
  const supabase = await createClient();

  try {
    const today = new Date();
    const monthStart =
      (startDate || new Date(today.getFullYear(), today.getMonth(), 1))
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";
    const monthEnd =
      moment(
        endDate ||
          new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      )
        .add("day", 1)
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";

    let query = supabase
      .from("view_orders")
      .select("created_at, total_price")
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd);

    if (branchId && branchId !== "") {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group orders by date
    const dailyVolume: Record<string, { count: number; amount: number }> = {};

    data?.forEach((order) => {
      const orderDate = new Date(order.created_at).toISOString().split("T")[0];
      if (!dailyVolume[orderDate]) {
        dailyVolume[orderDate] = { count: 0, amount: 0 };
      }
      dailyVolume[orderDate].count += 1;
      dailyVolume[orderDate].amount += Number(order.total_price || 0);
    });

    // Convert to array format and fill missing dates with 0
    const result: DailyOrderVolume[] = [];
    const currentDate = new Date(startDate);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayData = dailyVolume[dateStr] || { count: 0, amount: 0 };

      result.push({
        date: dateStr,
        order_count: dayData.count,
        total_amount: dayData.amount,
        day_name: dayNames[currentDate.getDay()],
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error("getDailyOrderVolume", error);
    return {
      data: [],
      error,
    };
  }
};

export const getOrderPerformanceMetrics = async (
  startDate: Date,
  endDate: Date,
  branchId?: string
) => {
  const supabase = await createClient();

  try {
    const today = new Date();
    const monthStart =
      (startDate || new Date(today.getFullYear(), today.getMonth(), 1))
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";
    const monthEnd =
      moment(
        endDate ||
          new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      )
        .add("day", 1)
        .toISOString()
        .split("T")[0] + "T00:00:00.000Z";

    let query = supabase
      .from("view_orders")
      .select("order_status, created_at, updated_at")
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd);

    if (branchId && branchId !== "") {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalOrders = data?.length || 0;
    const completedOrders =
      data?.filter((order) => order.order_status === "Picked up").length || 0;
    const cancelledOrders =
      data?.filter((order) => order.order_status === "Cancelled").length || 0;

    // Calculate completion and cancellation rates
    const completionRate =
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const cancellationRate =
      totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

    // Calculate average processing time (using updated_at as pickup time for completed orders)
    const processedOrders =
      data?.filter(
        (order) => order.order_status === "Picked up" && order.updated_at
      ) || [];
    let avgProcessingTime = 0;

    if (processedOrders.length > 0) {
      const totalProcessingDays = processedOrders.reduce((sum, order) => {
        const created = new Date(order.created_at);
        const updated = new Date(order.updated_at);
        const diffTime = Math.abs(updated.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      avgProcessingTime =
        Math.round((totalProcessingDays / processedOrders.length) * 10) / 10;
    }

    // Find peak day
    const dailyCounts: Record<string, number> = {};
    data?.forEach((order) => {
      const dayName = new Date(order.created_at).toLocaleDateString("en-US", {
        weekday: "long",
      });
      dailyCounts[dayName] = (dailyCounts[dayName] || 0) + 1;
    });

    let peakDay = "Monday";
    let peakDayCount = 0;
    Object.entries(dailyCounts).forEach(([day, count]) => {
      if (count > peakDayCount) {
        peakDay = day;
        peakDayCount = count;
      }
    });

    const metrics: OrderPerformanceMetrics = {
      total_orders: totalOrders,
      completion_rate: completionRate,
      cancellation_rate: cancellationRate,
      avg_processing_time: avgProcessingTime,
      peak_day: peakDay,
      peak_day_count: peakDayCount,
    };

    return {
      data: metrics,
      error: null,
    };
  } catch (error) {
    console.error("getOrderPerformanceMetrics", error);
    return {
      data: null,
      error,
    };
  }
};

export const getRecentOrders = async (
  limit: number = 10,
  branchId?: string
) => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("view_orders")
      .select(
        "order_id, customer_name, branch_name, total_price, order_status, payment_status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (branchId && branchId !== "") {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const orders: RecentOrder[] =
      data?.map((order) => ({
        id: order.order_id,
        customer_name: order.customer_name || "N/A",
        branch_name: order.branch_name || "N/A",
        total_amount: Number(order.total_price || 0),
        status: order.order_status,
        payment_status: order.payment_status || "Unpaid",
        created_at: order.created_at,
      })) || [];

    return {
      data: orders,
      error: null,
    };
  } catch (error) {
    console.error("getRecentOrders", error);
    return {
      data: [],
      error,
    };
  }
};

export const getRecentOrdersByCustomer = async (
  customerId: string,
  limit: number = 10
) => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("view_orders")
      .select(
        "order_id, customer_name, branch_name, total_price, order_status, payment_status, created_at, items"
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    const orders =
      data?.map((order) => ({
        id: order.order_id,
        customer_name: order.customer_name || "N/A",
        branch_name: order.branch_name || "N/A",
        total_amount: Number(order.total_price || 0),
        status: order.order_status,
        payment_status: order.payment_status || "Unpaid",
        created_at: order.created_at,
        items: Array.isArray(order.items) ? order.items : [],
      })) || [];

    return {
      data: orders,
      error: null,
    };
  } catch (error) {
    console.error("getRecentOrdersByCustomer", error);
    return {
      data: [],
      error,
    };
  }
};
