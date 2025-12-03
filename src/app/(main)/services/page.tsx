import { redirect } from "next/navigation";
import { MainServicePage } from "./components/main";
import { getAllServices, getUserInfo } from "@/app/actions";
import { ROLE_ADMIN } from "@/app/types";

export default async function Page() {
  const { data: userInfo } = await getUserInfo();

  if (userInfo?.role_name !== ROLE_ADMIN) {
    redirect("/orders");
  }

  const { data } = await getAllServices();

  return <MainServicePage initialData={data || []} />;
}
