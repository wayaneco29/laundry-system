import { cookies } from "next/headers";
import { MainServicePage } from "./components/main";
import { getAllServices, getUserInfo } from "@/app/actions";

export default async function Page() {
  const {
    data: { branch_id },
  } = await getUserInfo();

  // Get selected branch from cookie (user's selection) or fallback to user's default branch
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get("selected_branch_id")?.value;
  const branchId = selectedBranchId || branch_id || undefined;

  const { data } = await getAllServices({
    branchId,
  });

  return <MainServicePage initialData={data || []} />;
}
