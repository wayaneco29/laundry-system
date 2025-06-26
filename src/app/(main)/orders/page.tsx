import { getOrders } from "@/app/actions";
import { OrdersPage } from "./components/main";
import { Suspense } from "react";

interface OrdersPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    branchId?: string;
  };
}

export default async function Page({ searchParams }: OrdersPageProps) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 25;

  const { data, count } = await getOrders({
    page,
    limit,
    search: searchParams.search,
    status: searchParams.status,
    branchId: searchParams.branchId,
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersPage
        data={data || []}
        totalCount={count || 0}
        searchParams={searchParams}
      />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
