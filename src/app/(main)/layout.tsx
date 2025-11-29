import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { SidebarContextProvider, UserContextProvided } from "@/app/context";
import StaffShiftProvider from "@/app/components/providers/staff-shift-provider";
import { PrinterProvider } from "@/app/context/PrinterContext";
import { getSelectedBranchId } from "../actions/auth";

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

  // Get the selected branch ID from the login cookie
  const selectedBranchId = await getSelectedBranchId();

  return (
    <UserContextProvided user={logged_in_user as any} selectedBranchId={selectedBranchId}>
      <StaffShiftProvider>
        <PrinterProvider>
          <SidebarContextProvider>{props?.children}</SidebarContextProvider>
        </PrinterProvider>
      </StaffShiftProvider>
    </UserContextProvided>
  );
}
