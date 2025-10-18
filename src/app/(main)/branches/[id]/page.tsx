import { getBranchInfo } from "@/app/actions/branch/get_branch";
import { MainBranchIDPage } from "./components/main";

type StockType = {
  branch_stock_id: string;
  stock_id: string;
  stock_name: string;
  branch_id: string;
  branch_name: string;
  quantity: number;
};

type MainBranchIDPageProps = {
  id: string;
  name: string;
  description: string;
  address: string;
  stocks: Array<StockType>;
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await getBranchInfo(id);

  return <MainBranchIDPage branch_info={data as MainBranchIDPageProps} />;
}
