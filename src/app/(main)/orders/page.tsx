import { getOrders, getUserInfo } from "@/app/actions";
import { OrdersPage } from "./components/main";

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Fetch initial orders data on server-side
  const { data, count } = await getOrders({
    branchId: branch_id || undefined,
  });

  return <OrdersPage data={data || []} totalCount={count || 0} />;
}

export const dynamic = "force-dynamic";
