import { getAllBranches, getAllBranchStocks } from "@/app/actions";
import { MainInventoryPage } from "./components/main";

export default async function Page() {
  const [inventoryResult, branchesResult] = await Promise.all([
    getAllBranchStocks({
      page: 1,
      limit: 10,
      search: "",
      branchId: "",
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
