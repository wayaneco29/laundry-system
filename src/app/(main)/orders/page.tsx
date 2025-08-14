import { getOrders, getUserInfo } from "@/app/actions";
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
  const {
    data: { branch_id },
  } = await getUserInfo();

  const { data, count } = await getOrders({
    branchId: branch_id || undefined,
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersPage data={data || []} totalCount={count || 0} />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
