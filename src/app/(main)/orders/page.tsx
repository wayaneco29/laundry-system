import { cookies } from "next/headers";
import { getOrders, getUserInfo } from "@/app/actions";
import { OrdersPage } from "./components/main";

// Helper to get today's date in local timezone as YYYY-MM-DD
function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Get selected branch from cookie (user's selection) or fallback to user's default branch
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get("selected_branch_id")?.value;
  const branchId = selectedBranchId || branch_id || undefined;

  // Default to today's orders for better performance
  const today = getTodayDate();

  // Fetch initial orders data on server-side (today only by default)
  const { data, count } = await getOrders({
    branchId,
    startDate: `${today}T00:00:00`,
    endDate: `${today}T23:59:59`,
  });

  return (
    <OrdersPage data={data || []} totalCount={count || 0} initialDate={today} />
  );
}

export const dynamic = "force-dynamic";
