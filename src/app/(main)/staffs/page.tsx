import { getAllStaffs } from "@/app/actions";
import { MainStaffPage } from "./components/main";

export default async function Page() {
  const { data } = await getAllStaffs();

  return <MainStaffPage staff_list={JSON.parse(JSON.stringify(data))} />;
}
