import { getAllCustomers } from "@/app/actions/customer/get_all_customers";
import { MainCustomerPage } from "./components/main";

export default async function Page() {
  const { data } = await getAllCustomers();

  return <MainCustomerPage customer_list={JSON.parse(JSON.stringify(data))} />;
}
