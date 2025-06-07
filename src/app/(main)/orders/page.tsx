import { getOrders } from "@/app/actions";
import { OrdersPage } from "./components/main";

export default async function Page() {
  const { data } = await getOrders();
  return <OrdersPage data={data as Array<any>} />;
}
