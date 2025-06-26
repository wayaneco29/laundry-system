import { getAllBranches } from "@/app/actions";
import { MainBranchesPage } from "./components/main";

interface BranchesPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
}

export default async function Page({ searchParams }: BranchesPageProps) {
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 10;
  const search = searchParams?.search || undefined;

  const { data, count } = await getAllBranches({ page, limit, search });

  return (
    <MainBranchesPage
      branch_list={data || []}
      totalCount={count || 0}
      searchParams={searchParams}
    />
  );
}
