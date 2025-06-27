import { getAllPromos } from "@/app/actions";
import { MainPromoPage } from "./components/main";

export default async function Page() {
  const { data, count } = await getAllPromos({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });

  return <MainPromoPage initialData={data || []} count={count || 0} />;
}
