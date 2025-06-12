"use server";

import { createClient } from "@/app/utils/supabase/server";

export async function getTodayCustomers(): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient();
  
  try {
    // Get current date info (start of today)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000); // End of today
    
    // Count customers created today
    const { count, error } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString());

    if (error) throw error;

    return { count: count || 0, error: null };
  } catch (error) {
    return { 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}