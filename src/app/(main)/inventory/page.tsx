import { getAllBranches, getAllBranchStocks, getUserInfo } from "@/app/actions";
import { MainInventoryPage } from "./components/main";

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();
  const [inventoryResult, branchesResult] = await Promise.all([
    getAllBranchStocks({
      branchId: branch_id || undefined,
    }),
    getAllBranches(),
  ]);

  return (
    <MainInventoryPage
      initialData={inventoryResult?.data || []}
      count={inventoryResult?.count || 0}
      branches={branchesResult?.data || []}
    />
  );
}
