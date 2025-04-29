import { getAllBranches } from "@/app/actions";

import { MainBranchesPage } from "./components/main";

export default async function Page() {
  const { data } = await getAllBranches();

  return <MainBranchesPage branch_list={JSON.parse(JSON.stringify(data))} />;
}
