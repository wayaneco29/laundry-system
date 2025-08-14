import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { SidebarContextProvider, UserContextProvided } from "@/app/context";

export default async function MainLayout(props: PropsWithChildren) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logged_in_user } = await supabase
    .from("view_app_users")
    .select()
    .eq("user_id", user?.id)
    .single();

  if (!user) {
    redirect("/login");
  }

  console.log({ logged_in_user });

  return (
    <UserContextProvided user={logged_in_user as any}>
      <SidebarContextProvider>{props?.children}</SidebarContextProvider>
    </UserContextProvided>
  );
}
