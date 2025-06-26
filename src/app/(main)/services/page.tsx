import { getAllServices } from "@/app/actions";
import { MainServicePage } from "./components/main";

interface ServicesPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
}

export default async function Page({ searchParams }: ServicesPageProps) {
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 15;
  const search = searchParams?.search || undefined;

  const { data, count } = await getAllServices({ page, limit, search });

  return (
    <MainServicePage
      services_list={data || []}
      totalCount={count || 0}
      searchParams={searchParams}
    />
  );
}
