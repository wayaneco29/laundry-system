import { cookies } from "next/headers";
import {
  getMonthlyCustomers,
  getTodayCustomers,
  getMonthSales,
  getMonthlySalesChart,
  getUserInfo,
} from "@/app/actions";
import { getRecentOrders } from "@/app/actions/order";
import {
  getMonthlyExpense,
  getYearlyExpense,
  getExpensesByCategory,
} from "@/app/actions/expense";
import { getAllBranches } from "@/app/actions/branch";
import { MainDashboardPage } from "./components/main";

export default async function Page() {
  const currentYear = new Date().getFullYear();

  // Get user info for default branch
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Get selected branch from cookie (user's selection) or fallback to user's default branch
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get("selected_branch_id")?.value;
  const branchId = selectedBranchId || branch_id || undefined;

  // Fetch all data in parallel on server-side
  const [
    monthlyResult,
    todayResult,
    salesResult,
    chartResult,
    branchesResult,
    monthlyExpenseResult,
    yearlyExpenseResult,
    recentOrdersResult,
    expensesByCategoryResult,
  ] = await Promise.all([
    getMonthlyCustomers(branchId),
    getTodayCustomers(branchId),
    getMonthSales(branchId),
    getMonthlySalesChart(branchId),
    getAllBranches(),
    getMonthlyExpense(branchId),
    getYearlyExpense(branchId),
    getRecentOrders(10, branchId),
    getExpensesByCategory({
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      branchId,
    }),
  ]);

  return (
    <MainDashboardPage
      initialMonthlyCustomersCount={monthlyResult.count}
      initialTodayCustomersCount={todayResult.count}
      initialMonthlySalesData={salesResult.data}
      initialChartData={chartResult.data}
      initialBranches={branchesResult.data || []}
      initialMonthlyExpense={monthlyExpenseResult.data || 0}
      initialYearlyExpense={yearlyExpenseResult.data || 0}
      initialRecentOrders={recentOrdersResult.data || []}
      initialExpensesByCategory={expensesByCategoryResult.data || []}
    />
  );
}
