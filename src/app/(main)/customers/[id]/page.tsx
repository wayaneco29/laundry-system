import { getCustomer } from "@/app/actions/customer/get_customer";
import { MainCustomerIdPage } from "./components/main";

export default async function Page({ params }: { params: { id: string } }) {
  const { data } = await getCustomer(params?.id);

  return (
    <MainCustomerIdPage customer_info={JSON.parse(JSON.stringify(data))} />
  );
}

export const dynamic = "force-dynamic";
