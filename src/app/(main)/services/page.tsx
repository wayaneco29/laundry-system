import { cookies } from "next/headers";
import { MainServicePage } from "./components/main";
import { getAllServices, getUserInfo } from "@/app/actions";

export default async function Page() {
  const { data } = await getAllServices();

  return <MainServicePage initialData={data || []} />;
}
