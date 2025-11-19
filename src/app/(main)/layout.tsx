import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { SidebarContextProvider, UserContextProvided } from "@/app/context";
import StaffShiftProvider from "@/app/components/providers/staff-shift-provider";
import { PrinterProvider } from "@/app/context/PrinterContext";
import { loginUser } from "../actions/auth";

export default async function MainLayout(props: PropsWithChildren) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logged_in_user } = await supabase
    .from("view_app_users")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (!user) {
    redirect("/login");
  }

  // Transform branches array to branch_ids and branch_names arrays
  if (logged_in_user && logged_in_user.branches) {
    const branches = Array.isArray(logged_in_user.branches) ? logged_in_user.branches : [];
    logged_in_user.branch_ids = branches.map((branch: any) => branch.id);
    logged_in_user.branch_names = branches.map((branch: any) => branch.name);
  } else if (logged_in_user) {
    logged_in_user.branch_ids = [];
    logged_in_user.branch_names = [];
  }

  return (
    <UserContextProvided user={logged_in_user as any}>
      <PrinterProvider>
        <SidebarContextProvider>
          <StaffShiftProvider>{props?.children}</StaffShiftProvider>
        </SidebarContextProvider>
      </PrinterProvider>
    </UserContextProvided>
  );
}
