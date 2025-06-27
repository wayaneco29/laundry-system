import { getAllStaffs } from "@/app/actions";
import { MainStaffPage } from "./components/main";

export default async function Page() {
  const { data } = await getAllStaffs({
    page: 1,
    limit: 10,
    search: "",
  });
  return <MainStaffPage initialData={data || []} />;
}
