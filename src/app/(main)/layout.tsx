import { PropsWithChildren } from "react";

import { SidebarContextProvider } from "@/context";

export default function MainLayout(props: PropsWithChildren) {
  return <SidebarContextProvider>{props?.children}</SidebarContextProvider>;
}
