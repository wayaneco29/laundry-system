import { getAllCustomers } from "@/app/actions";
import { MainCustomerPage } from "./components/main";

interface CustomersPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
}

export default async function Page({ searchParams }: CustomersPageProps) {
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 20;
  const search = searchParams?.search || undefined;

  const { data, count } = await getAllCustomers({ page, limit, search });

  return (
    <MainCustomerPage
      customer_list={data || []}
      totalCount={count || 0}
      searchParams={searchParams}
    />
  );
}
