import { PropsWithChildren } from "react";

import { SidebarContextProvider } from "@/app/context";

export default function MainLayout(props: PropsWithChildren) {
  return <SidebarContextProvider>{props?.children}</SidebarContextProvider>;
}
