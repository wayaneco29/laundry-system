import { MainServicePage } from "./components/main";

import { getAllServices, getUserInfo } from "@/app/actions";

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();

  const { data } = await getAllServices({
    branchId: branch_id || undefined,
  });

  return <MainServicePage initialData={data || []} />;
}
