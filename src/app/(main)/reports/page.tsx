import {
  getMonthSales,
  getMonthlySalesChart,
  getMonthlyCustomers,
  getTodayCustomers,
  getUserInfo,
} from "@/app/actions";
import { MainReportsPage } from "./components/main";

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();
  const [
    monthlySalesData,
    chartData,
    monthlyCustomersCount,
    todayCustomersCount,
  ] = await Promise.all([
    getMonthSales(branch_id || undefined),
    getMonthlySalesChart(branch_id || undefined),
    getMonthlyCustomers(branch_id || undefined),
    getTodayCustomers(branch_id || undefined),
  ]);

  return (
    <MainReportsPage
      monthlySalesData={monthlySalesData.data}
      chartData={chartData.data}
      monthlyCustomersCount={monthlyCustomersCount.count || 0}
      todayCustomersCount={todayCustomersCount.count || 0}
    />
  );
}
