import { getAllPromos } from "@/app/actions";

import { MainPromoPage } from "./components/main";

export default async function Page() {
  const { data } = await getAllPromos();

  return <MainPromoPage promo_list={JSON.parse(JSON.stringify(data))} />;
}
