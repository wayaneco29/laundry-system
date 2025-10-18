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
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="text-center sm:text-start">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Order Management
          </h1>
          <p className="text-slate-600">
            Manage and track your orders efficiently
          </p>
        </div>
        <Button
          leftIcon={<PlusIcon className="size-4" />}
          className="w-full sm:w-auto sm:self-start"
          onClick={() => router.push("/orders/add")}
        >
          Add Order
        </Button>
      </div>

      {/* Orders Table */}
      <div className="mt-2">
        <OrdersTable initialData={data} totalCount={totalCount} />
      </div>

      <OrderModal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
