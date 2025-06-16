import { 
  getMonthSales, 
  getMonthlySalesChart, 
  getMonthlyCustomers, 
  getTodayCustomers 
} from "@/app/actions";
import { MainReportsPage } from "./components/main";

export default async function Page() {
  const [
    monthlySalesData,
    chartData,
    monthlyCustomersCount,
    todayCustomersCount
  ] = await Promise.all([
    getMonthSales(),
    getMonthlySalesChart(),
    getMonthlyCustomers(),
    getTodayCustomers()
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