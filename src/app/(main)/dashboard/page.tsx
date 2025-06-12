import { getMonthlyCustomers, getTodayCustomers, getMonthSales } from "@/app/actions";
import { MainDashboardPage } from "./components/main";

export default async function Page() {
  const [monthlyResult, todayResult, salesResult] = await Promise.all([
    getMonthlyCustomers(),
    getTodayCustomers(),
    getMonthSales()
  ]);
  
  console.log(monthlyResult.data);
  return (
    <MainDashboardPage 
      monthlyCustomersCount={monthlyResult.count} 
      todayCustomersCount={todayResult.count}
      monthlySalesData={salesResult.data}
    />
  );
}
