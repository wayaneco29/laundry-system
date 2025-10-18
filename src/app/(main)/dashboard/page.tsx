import {
  getMonthlyCustomers,
  getTodayCustomers,
  getMonthSales,
  getMonthlySalesChart,
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
    getMonthlyCustomers(),
    getTodayCustomers(),
    getMonthSales(),
    getMonthlySalesChart(),
    getAllBranches(),
    getMonthlyExpense(),
    getYearlyExpense(),
    getRecentOrders(10),
    getExpensesByCategory({
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
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
