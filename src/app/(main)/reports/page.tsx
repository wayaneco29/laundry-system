import { cookies } from "next/headers";
import {
  getMonthSales,
  getMonthlySalesChart,
  getMonthlyCustomers,
  getTodayCustomers,
  getUserInfo,
} from "@/app/actions";
import { getAllBranches } from "@/app/actions/branch";
import { MainReportsPage } from "./components/main";

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Get selected branch from cookie (user's selection) or fallback to user's default branch
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get("selected_branch_id")?.value;
  const branchId = selectedBranchId || branch_id || undefined;

  const [
    monthlySalesData,
    chartData,
    monthlyCustomersCount,
    todayCustomersCount,
    branchesResult,
  ] = await Promise.all([
    getMonthSales(branchId),
    getMonthlySalesChart(branchId),
    getMonthlyCustomers(),
    getTodayCustomers(),
    getAllBranches(),
  ]);

  return (
    <MainReportsPage
      monthlySalesData={monthlySalesData.data}
      chartData={chartData.data}
      monthlyCustomersCount={monthlyCustomersCount.count || 0}
      todayCustomersCount={todayCustomersCount.count || 0}
      initialBranches={branchesResult.data || []}
    />
  );
}
