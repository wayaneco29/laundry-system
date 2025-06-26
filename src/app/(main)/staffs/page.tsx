import { getAllStaffs } from "@/app/actions";
import { MainStaffPage } from "./components/main";

interface StaffsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
}

export default async function Page({ searchParams }: StaffsPageProps) {
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 15;
  const search = searchParams?.search || undefined;

  const { data, count } = await getAllStaffs({ page, limit, search });

  return (
    <MainStaffPage
      staff_list={data || []}
      totalCount={count || 0}
      searchParams={searchParams}
    />
  );
}
