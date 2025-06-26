"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { customerRevalidateTag } from "@/app/actions";
import { UpsertCustomerModal } from "./upsert-customer-modal";
import { CustomersTable } from "./customers-table";

type MainCustomerPageProps = {
  customer_list: Array<Record<string, string>>;
  totalCount: number;
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
};

export function MainCustomerPage({
  customer_list,
  totalCount,
  searchParams,
}: MainCustomerPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);

  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Customer Management
          </h1>
          <p className="text-slate-600">
            Manage your customers and their information
          </p>
        </div>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-100 text-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          <Plus className="size-4" /> Add Customer
        </button>
      </div>
      <div className="mt-4">
        <div className="flex flex-col">
          <CustomersTable
            data={customer_list}
            totalCount={totalCount}
            searchParams={searchParams}
            onView={(customer) => {
              customerRevalidateTag("getCustomer");
              router.push(`/customers/${customer?.customer_id}`);
            }}
          />
        </div>
      </div>
      <UpsertCustomerModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
