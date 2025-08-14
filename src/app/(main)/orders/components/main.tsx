"use client";

import { useState, useEffect } from "react";

import { OrdersTable } from "@/app/components";
import { OrderModal } from "./order-modal";
import { useRouter } from "next/navigation";
import { PlusIcon, Search } from "lucide-react";
import { Button } from "@/app/components/common";

type OrdersPageProps = {
  data: Array<any>;
  totalCount: number;
};

export function OrdersPage({ data, totalCount }: OrdersPageProps) {
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
        <Button
          leftIcon={<PlusIcon className="size-4" />}
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => router.push("/orders/add")}
        >
          Add Order
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <OrdersTable initialData={data} totalCount={totalCount} />
        </div>
      </div>
      <OrderModal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
