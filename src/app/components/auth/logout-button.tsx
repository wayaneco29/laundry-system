"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { endStaffShift, updateShiftPartner } from "@/app/actions/staff/shift_actions";
import { useToast } from "@/app/hooks";

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function LogoutButton({ children, className = "" }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { userId } = useCurrentUser();
  const toast = useToast();

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      // Handle staff shift before logging out if user exists
      if (userId) {
        try {
          const supabase = createClient();
          const today = new Date().toISOString().split('T')[0];
          
          // Check if user is primary staff in an active shift
          const { data: primaryShifts } = await supabase
            .from("staff_shifts")
            .select("id")
            .eq("primary_staff_id", userId)
            .eq("is_active", true)
            .eq("shift_date", today);
          
          // Check if user is a partner in an active shift
          const { data: partnerShifts } = await supabase
            .from("staff_shifts")
            .select("id")
            .eq("partner_staff_id", userId)
            .eq("is_active", true)
            .eq("shift_date", today);
          
          if (primaryShifts && primaryShifts.length > 0) {
            // User is primary staff - end the entire shift
            await endStaffShift(userId);
          } else if (partnerShifts && partnerShifts.length > 0) {
            // User is just a partner - remove them from the shift
            await updateShiftPartner(partnerShifts[0].id, undefined);
          }
        } catch (error) {
          // Log the error but don't prevent logout
          console.error("Error handling staff shift during logout:", error);
        }
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        toast.error("Failed to logout. Please try again.");
        return;
      }

      setIsLoading(false);
      setIsRedirecting(true);
      toast.success("Logout successful! Redirecting...");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout.");
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading || isRedirecting}
      className={`${className} w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading || isRedirecting ? (
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {isRedirecting ? (children || "Redirecting...") : (children || "Logging out...")}
        </div>
      ) : (
        children || "Logout"
      )}
    </button>
  );
}
