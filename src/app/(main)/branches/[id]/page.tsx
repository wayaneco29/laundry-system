import { getBranch } from "@/app/actions/branch/get_branch";
import { MainBranchIDPage } from "./components/main";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const { data } = await getBranch(id);

  return <MainBranchIDPage branch_info={data} />;
}
