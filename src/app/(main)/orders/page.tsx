import { cookies } from "next/headers";
import { getOrders, getUserInfo } from "@/app/actions";
import { OrdersPage } from "./components/main";

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Get selected branch from cookie (user's selection) or fallback to user's default branch
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get("selected_branch_id")?.value;
  const branchId = selectedBranchId || branch_id || undefined;

  // Fetch initial orders data on server-side
  const { data, count } = await getOrders({
    branchId,
  });

  return <OrdersPage data={data || []} totalCount={count || 0} />;
}

export const dynamic = "force-dynamic";
