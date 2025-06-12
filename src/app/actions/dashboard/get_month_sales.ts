"use server";

import { createClient } from "@/app/utils/supabase/server";

export type MonthlySalesData = {
  paidSales: number;
  unpaidSales: number;
  totalSales: number;
};

export async function getMonthSales(): Promise<{ data: MonthlySalesData | null; error: string | null }> {
  const supabase = await createClient();
  
  try {
    // Get current month date range
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    // Fetch paid and unpaid sales for this month in parallel
    const [paidResult, unpaidResult] = await Promise.all([
      // Paid sales this month
      supabase
        .from('sales')
        .select('total_price')
        .eq('status', 'Paid')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString()),
      
      // Unpaid sales this month
      supabase
        .from('sales')
        .select('total_price')
        .eq('status', 'Unpaid')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
    ]);

    if (paidResult.error) throw paidResult.error;
    if (unpaidResult.error) throw unpaidResult.error;

    const paidSales = paidResult.data?.reduce((sum, sale) => sum + (sale.total_price || 0), 0) || 0;
    const unpaidSales = unpaidResult.data?.reduce((sum, sale) => sum + (sale.total_price || 0), 0) || 0;
    const totalSales = paidSales + unpaidSales;

    const data: MonthlySalesData = {
      paidSales,
      unpaidSales,
      totalSales
    };

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}