import { getAllPromos } from "@/app/actions";
import { MainPromoPage } from "./components/main";

interface PromosPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  };
}

export default async function Page({ searchParams }: PromosPageProps) {
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 15;
  const search = searchParams?.search || undefined;
  const status = searchParams?.status || undefined;

  const { data, count } = await getAllPromos({ page, limit, search, status });

  return (
    <MainPromoPage
      promo_list={data || []}
      totalCount={count || 0}
      searchParams={searchParams}
    />
  );
}
