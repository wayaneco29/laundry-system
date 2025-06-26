"use client";

import { useState } from "react";

import { OrdersTable } from "@/app/components";
import { OrderModal } from "./order-modal";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

type OrdersPageProps = {
  data: Array<any>;
  totalCount: number;
  searchParams?: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    branchId?: string;
  };
};

export function OrdersPage({
  data,
  totalCount,
  searchParams,
}: OrdersPageProps) {
  const router = useRouter();

  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Order Management
          </h1>
          <p className="text-slate-600">
            Manage and track your orders efficiently
          </p>
        </div>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-100 text-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => router.push("/orders/add")}
        >
          <PlusIcon className="size-4" /> Add Order
        </button>
      </div>
      <div className="mt-4">
        <div className="flex flex-col">
          <OrdersTable
            initialData={data}
            totalCount={totalCount}
            searchParams={searchParams}
          />
        </div>
      </div>
      <OrderModal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
