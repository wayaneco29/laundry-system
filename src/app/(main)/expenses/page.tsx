import { cookies } from "next/headers";
import { getUserInfo } from "@/app/actions";
import { ExpensesMain } from "./components/main";
import { getAllExpenses } from "@/app/actions/expense";

export default async function ExpensesPage({}) {
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Get selected branch from cookie (user's selection) or fallback to user's default branch
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get("selected_branch_id")?.value;
  const branchId = selectedBranchId || branch_id || undefined;

  // Fetch initial data on server side
  const initialExpenses = await getAllExpenses({
    branchId,
    page: 1,
    limit: 20,
  });

  return (
    <ExpensesMain
      initialData={initialExpenses.data || []}
      initialCount={initialExpenses.count || 0}
    />
  );
}

export const metadata = {
  title: "Expenses | Laundry System",
  description: "Manage business expenses and track spending",
};
