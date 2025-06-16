import { getAllCustomers } from "@/app/actions";
import { MainCustomerPage } from "./components/main";

export default async function Page() {
  const { data } = await getAllCustomers();

  return <MainCustomerPage customer_list={JSON.parse(JSON.stringify(data))} />;
}
