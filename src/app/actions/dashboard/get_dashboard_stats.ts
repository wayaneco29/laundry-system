"use server";

import { createClient } from "@/app/utils/supabase/server";

export type DashboardStats = {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
};

export async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: string | null }> {
  const supabase = await createClient();
  
  try {
    // Get current date info
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Fetch all required data in parallel
    const [
      customersResult,
      ordersResult,
      salesResult,
      todaySalesResult,
      monthSalesResult
    ] = await Promise.all([
      // Total customers
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      
      // All orders
      supabase.from('orders').select('*'),
      
      // All sales for total revenue
      supabase.from('sales').select('total_price, created_at'),
      
      // Today's sales
      supabase.from('sales')
        .select('total_price')
        .gte('created_at', todayStart.toISOString()),
      
      // This month's sales
      supabase.from('sales')
        .select('total_price')
        .gte('created_at', monthStart.toISOString())
    ]);

    // Handle any errors
    if (customersResult.error) throw customersResult.error;
    if (ordersResult.error) throw ordersResult.error;
    if (salesResult.error) throw salesResult.error;
    if (todaySalesResult.error) throw todaySalesResult.error;
    if (monthSalesResult.error) throw monthSalesResult.error;

    const orders = ordersResult.data || [];
    const sales = salesResult.data || [];
    const todaySales = todaySalesResult.data || [];
    const monthSales = monthSalesResult.data || [];

    // Calculate statistics
    const totalCustomers = customersResult.count || 0;
    const totalOrders = orders.length;
    
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
    const thisMonthRevenue = monthSales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
    
    const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;
    
    const pendingOrders = orders.filter(order => 
      order.status === 'Pending' || order.status === 'Ongoing'
    ).length;
    
    const completedOrders = orders.filter(order => 
      order.status === 'Picked up'
    ).length;

    const stats: DashboardStats = {
      totalCustomers,
      totalOrders,
      totalRevenue,
      todayRevenue,
      thisMonthRevenue,
      avgOrderValue,
      pendingOrders,
      completedOrders
    };

    return { data: stats, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getRecentOrders(limit: number = 5) {
  const supabase = await createClient();
  
  try {
    // Get recent orders with customer and branch info
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers!inner(full_name, phone),
        branches!inner(name),
        sales!inner(total_price, payment_status)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform data to match OrdersTable expected format
    const transformedOrders = orders?.map(order => ({
      order_id: order.order_id,
      customer_name: order.customers.full_name,
      customer_phone: order.customers.phone,
      branch_name: order.branches.name,
      branch_id: order.branch_id,
      order_status: order.status,
      payment_status: order.sales[0]?.payment_status || 'Unpaid',
      total_price: order.sales[0]?.total_price || 0,
      order_date: order.date_ordered || order.created_at,
      items: []
    })) || [];

    return { data: transformedOrders, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}