import { getMonthlyCustomers } from "@/app/actions";
import { MainDashboardPage } from "./components/main";

export default async function Page() {
  const { count, data } = await getMonthlyCustomers();
  console.log(data);
  return <MainDashboardPage monthlyCustomersCount={count} />;
}
