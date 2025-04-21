import { getCustomer } from "@/app/actions/customer/get_customer";
import { MainCustomerIdPage } from "./components/main";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: PageProps) {
  const { data } = await getCustomer(params?.id);

  return (
    <MainCustomerIdPage customer_info={JSON.parse(JSON.stringify(data))} />
  );
}

export const dynamic = "force-dynamic";
