import { getAllServices } from "@/app/actions";

import { MainAddPage } from "./components/main";

export default async function AddOrderPage() {
  const { data } = await getAllServices();

  return <MainAddPage data={data} />;
}
