"use client";

import { useState, useEffect } from "react";

import { OrdersTable } from "@/app/components";
import { OrderModal } from "./order-modal";
import { useRouter } from "next/navigation";
import { PlusIcon, Search } from "lucide-react";

type OrdersPageProps = {
  data: Array<any>;
  totalCount: number;
};

export function OrdersPage({ data, totalCount }: OrdersPageProps) {
  const router = useRouter();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

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

      <div className="relative mt-4 w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order ID or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <OrdersTable
            initialData={data}
            totalCount={totalCount}
            search={debouncedSearch}
          />
        </div>
      </div>
      <OrderModal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
