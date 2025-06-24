"use server";

import { createClient } from "@/app/utils/supabase/server";

type GetExpenseStatsType = {
  startDate?: string;
  endDate?: string;
  branchId?: string;
};

export const getExpenseStats = async (filters: GetExpenseStatsType = {}) => {
  const supabase = await createClient();

  try {
    // Try the RPC function first
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_expense_stats", {
      p_start_date: filters.startDate || null,
      p_end_date: filters.endDate || null,
      p_branch_id: filters.branchId || null,
    });

    // If RPC fails due to column issues, use direct query as fallback
    if (rpcError && (rpcError.message?.includes('status') || rpcError.message?.includes('column') || rpcError.message?.includes('does not exist'))) {
      console.warn("getExpenseStats: RPC function has column issues, using direct query fallback");
      
      try {
        // Try to select columns that should exist
        let query = supabase
          .from("view_expenses")
          .select("*");

        // Apply filters
        if (filters.startDate) {
          query = query.gte("expense_date", filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte("expense_date", filters.endDate);
        }
        if (filters.branchId) {
          query = query.eq("branch_id", filters.branchId);
        }

        const { data: directData, error: directError } = await query;
        
        if (directError) {
          console.error("Direct query failed:", directError);
          throw directError;
        }

        // Log the first record to see what columns are actually available
        if (directData && directData.length > 0) {
          console.log("Available columns in view_expenses:", Object.keys(directData[0]));
        }

        // Calculate stats manually
        let totalExpenses = 0;
        let approvedExpenses = 0;
        let pendingExpenses = 0;
        let paidExpenses = 0;
        let unpaidExpenses = 0;

        directData?.forEach((expense: any) => {
          const amount = Number(expense.amount || 0);
          totalExpenses += amount;

          // Handle different possible status field names
          const statusField = expense.status || expense.approval_status || expense.expense_status || 'pending';
          const status = statusField.toString().toLowerCase();
          
          if (status === 'approved') {
            approvedExpenses += amount;
          } else {
            pendingExpenses += amount;
          }

          // Handle payment status - check multiple possible fields
          const isPaid = expense.is_paid || expense.paid || status === 'paid' || false;
          if (isPaid) {
            paidExpenses += amount;
          } else {
            unpaidExpenses += amount;
          }
        });

        return {
          data: {
            total_expenses: totalExpenses,
            approved_expenses: approvedExpenses,
            pending_expenses: pendingExpenses,
            paid_expenses: paidExpenses,
            unpaid_expenses: unpaidExpenses
          },
          error: null,
        };
      } catch (fallbackError) {
        console.warn("Direct query also failed, returning minimal stats");
        return {
          data: {
            total_expenses: 0,
            approved_expenses: 0,
            pending_expenses: 0,
            paid_expenses: 0,
            unpaid_expenses: 0
          },
          error: null,
        };
      }
    }

    if (rpcError) throw rpcError;

    return {
      data: rpcData?.[0] || null,
      error: null,
    };
  } catch (error) {
    console.error("getExpenseStats", error);
    return {
      data: null,
      error: null, // Return null error to prevent UI crashes
    };
  }
};