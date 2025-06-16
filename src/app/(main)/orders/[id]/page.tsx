import { getOrderById } from "@/app/actions";
import { MainOrderIdPage } from "./components/main";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await getOrderById({ id });

  return <MainOrderIdPage data={data} />;
}
