import {
  getMonthlyCustomers,
  getTodayCustomers,
  getMonthSales,
  getMonthlySalesChart,
} from "@/app/actions";
import { MainDashboardPage } from "./components/main";

export default async function Page() {
  const [monthlyResult, todayResult, salesResult, chartResult] =
    await Promise.all([
      getMonthlyCustomers(),
      getTodayCustomers(),
      getMonthSales(),
      getMonthlySalesChart(),
    ]);

  return (
    <MainDashboardPage
      monthlyCustomersCount={monthlyResult.count}
      todayCustomersCount={todayResult.count}
      monthlySalesData={salesResult.data}
      chartData={chartResult.data}
    />
  );
}
