import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { SidebarContextProvider } from "@/app/context";

export default async function MainLayout(props: PropsWithChildren) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <SidebarContextProvider>{props?.children}</SidebarContextProvider>;
}
