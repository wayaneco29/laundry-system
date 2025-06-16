import { getAllServices } from "@/app/actions";
import { MainServicePage } from "./components/main";

export default async function Page() {
  const { data } = await getAllServices();
  return <MainServicePage services_list={data} />;
}
