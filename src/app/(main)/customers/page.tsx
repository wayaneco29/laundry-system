import { getAllCustomers } from "@/app/actions";
import { MainCustomerPage } from "./components/main";

export default async function Page() {
  // Fetch initial customers data on server-side (default: 20 items per page)
  const { data, count } = await getAllCustomers({
    page: 1,
    limit: 20,
    search: "",
  });

  return <MainCustomerPage initialData={data || []} count={count || 0} />;
}
