import { getOrders, getUserInfo } from "@/app/actions";
import { OrdersPage } from "./components/main";
import { Suspense } from "react";

export default async function Page() {
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
