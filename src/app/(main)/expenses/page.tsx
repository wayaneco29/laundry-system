import { ExpensesMain } from "./components/main";

interface ExpensesPageProps {
  searchParams: {
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
  return <ExpensesMain searchParams={searchParams} />;
}

export const metadata = {
  title: "Expenses | Laundry System",
  description: "Manage business expenses and track spending",
};
