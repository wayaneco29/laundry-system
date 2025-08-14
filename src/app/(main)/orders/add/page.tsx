import { getAllBranches, getAllServices } from "@/app/actions";

import { MainAddPage } from "./components/main";

export default async function AddOrderPage() {
  const { data } = await getAllServices();
  const { data: branches } = await getAllBranches();

  return <MainAddPage data={data} branches={branches} />;
}
