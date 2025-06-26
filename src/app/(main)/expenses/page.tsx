import { getAllExpenses } from "@/app/actions/expense/get_all_expenses";
import { ExpensesMain } from "./components/main";

interface ExpensesPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    branchId?: string;
    status?: string;
  };
}

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 20;
  const search = searchParams?.search || undefined;
  const startDate = searchParams?.startDate || undefined;
  const endDate = searchParams?.endDate || undefined;
  const branchId = searchParams?.branchId || undefined;
  const status = searchParams?.status || undefined;

  const { data, count } = await getAllExpenses({
    page,
    limit,
    search,
    startDate,
    endDate,
    branchId,
    status,
  });

  return (
    <ExpensesMain
      expenses={data || []}
      totalCount={count || 0}
      searchParams={searchParams}
    />
  );
}

export const metadata = {
  title: "Expenses | Laundry System",
  description: "Manage business expenses and track spending",
};
