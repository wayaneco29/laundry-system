import { getOrders } from "@/app/actions";
import { OrdersPage } from "./components/main";

export default async function Page() {
  const { data } = await getOrders();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <OrdersPage data={data as Array<any>} />;
}
