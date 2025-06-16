import { getAllBranches } from "@/app/actions";
import { MainInventoryPage } from "./components/main";

export default async function Page() {
  const { data } = await getAllBranches();
  return <MainInventoryPage branches={data} />;
}