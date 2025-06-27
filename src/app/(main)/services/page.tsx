import { MainServicePage } from "./components/main";

import { getAllServices } from "@/app/actions";

export default async function Page() {
  const { data } = await getAllServices({
    page: 1,
    limit: 10,
    search: "",
  });

  return <MainServicePage initialData={data || []} />;
}
