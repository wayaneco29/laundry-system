import { getUserInfo } from "@/app/actions";
import { ExpensesMain } from "./components/main";
import { getAllExpenses } from "@/app/actions/expense";

export default async function ExpensesPage({}) {
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Fetch initial data on server side
  const initialExpenses = await getAllExpenses({
    branchId: branch_id,
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
