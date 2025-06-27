import { MainBranchesPage } from "./components/main";

import { getAllBranches } from "@/app/actions";

export default async function Page() {
  const { data } = await getAllBranches({
    page: 1,
    limit: 10,
    search: "",
  });
  return <MainBranchesPage initialData={data || []} />;
}
