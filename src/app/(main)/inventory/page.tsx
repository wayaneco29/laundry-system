import { cookies } from "next/headers";
import { getAllBranches, getAllBranchStocks, getUserInfo } from "@/app/actions";
import { MainInventoryPage } from "./components/main";

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Get selected branch from cookie (user's selection) or fallback to user's default branch
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get("selected_branch_id")?.value;
  const branchId = selectedBranchId || branch_id || undefined;

  const [inventoryResult, branchesResult] = await Promise.all([
    getAllBranchStocks({
      branchId,
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
