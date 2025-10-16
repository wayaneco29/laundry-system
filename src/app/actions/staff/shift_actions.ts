"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  StartStaffShiftParams,
  StaffView,
  ActiveStaffShift,
  StaffSalesReport,
} from "@/app/types/database";

/**
 * Start a new staff shift with optional partner
 */
export async function startStaffShift(params: StartStaffShiftParams) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("start_staff_shift", {
      p_primary_staff_id: params.p_primary_staff_id,
      p_branch_id: params.p_branch_id,
      p_partner_staff_id: params.p_partner_staff_id || null,
    });

    if (error) {
      console.error("Start shift error:", error);
      throw new Error(error.message);
    }

    revalidateTag("staff-shifts");
    revalidatePath("/dashboard");

    return { shift_id: data[0]?.shift_id };
  } catch (error) {
    console.error("Error starting staff shift:", error);
    throw error;
  }
}

/**
 * End the current active staff shift
 */
export async function endStaffShift(staffId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("end_staff_shift", {
      p_staff_id: staffId,
    });

    if (error) {
      console.error("End shift error:", error);
      throw new Error(error.message);
    }

    revalidateTag("staff-shifts");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error ending staff shift:", error);
    throw error;
  }
}

/**
 * Get active staff shift for a user
 */
export async function getActiveStaffShift(
  staffId: string
): Promise<ActiveStaffShift | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_active_staff_shift", {
      p_staff_id: staffId,
    });

    if (error) {
      console.error("Get active shift error:", error);
      throw new Error(error.message);
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Error getting active staff shift:", error);
    return null;
  }
}

/**
 * Get staff members by branch for partner selection
 */
export async function getStaffByBranch(branchId: string): Promise<StaffView[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("view_staffs")
      .select("*")
      .eq("branch_id", branchId)
      .order("full_name");

    if (error) {
      console.error("Get staff by branch error:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Error getting staff by branch:", error);
    throw error;
  }
}

/**
 * Get staff sales report for a specific date
 */
export async function getStaffSalesReport(
  staffId: string,
  date?: string
): Promise<StaffSalesReport | null> {
  try {
    const supabase = await createClient();
    const reportDate = date || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase.rpc("get_staff_sales_report", {
      p_staff_id: staffId,
      p_date: reportDate,
    });

    if (error) {
      console.error("Get staff sales report error:", error);
      throw new Error(error.message);
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Error getting staff sales report:", error);
    throw error;
  }
}

/**
 * Get all staff shifts for a date range (for reporting)
 */
export async function getStaffShifts(
  startDate: string,
  endDate: string,
  branchId?: string
) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("staff_shifts")
      .select(
        `
        *,
        primary_staff:staffs!staff_shifts_primary_staff_id_fkey(
          id,
          full_name:first_name,
          middle_name,
          last_name
        ),
        partner_staff:staffs!staff_shifts_partner_staff_id_fkey(
          id,
          full_name:first_name,
          middle_name,
          last_name
        ),
        branch:branches(
          id,
          name
        )
      `
      )
      .gte("shift_date", startDate)
      .lte("shift_date", endDate)
      .order("shift_date", { ascending: false });

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Get staff shifts error:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Error getting staff shifts:", error);
    throw error;
  }
}

/**
 * Update partner for an active staff shift
 */
export async function updateShiftPartner(
  shiftId: string,
  newPartnerId?: string
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("staff_shifts")
      .update({
        partner_staff_id: newPartnerId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shiftId)
      .eq("is_active", true);

    if (error) {
      console.error("Update shift partner error:", error);
      throw new Error(error.message);
    }

    revalidateTag("staff-shifts");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating shift partner:", error);
    throw error;
  }
}

/**
 * Remove partner from an active staff shift
 */
export async function removeShiftPartner(shiftId: string) {
  return updateShiftPartner(shiftId, undefined);
}

/**
 * Add partner to an active staff shift
 */
export async function addShiftPartner(shiftId: string, partnerId: string) {
  return updateShiftPartner(shiftId, partnerId);
}

/**
 * Check if staff needs to select a partner (for middleware)
 */
export async function checkStaffShiftStatus(staffId: string) {
  try {
    const activeShift = await getActiveStaffShift(staffId);
    return {
      hasActiveShift: !!activeShift,
      needsPairing: !activeShift,
      shiftData: activeShift,
    };
  } catch (error) {
    console.error("Error checking staff shift status:", error);
    return {
      hasActiveShift: false,
      needsPairing: true,
      shiftData: null,
    };
  }
}
