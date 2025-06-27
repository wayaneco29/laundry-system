import { getAllCustomers } from "@/app/actions";
import { MainCustomerPage } from "./components/main";

export default async function Page() {
  const { data, count } = await getAllCustomers({
    page: 1,
    limit: 10,
    search: "",
  });

  return <MainCustomerPage initialData={data || []} count={count || 0} />;
}
