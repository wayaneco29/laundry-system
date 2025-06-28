"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";

import { ServiceModal } from "./service-modal";
import { ServiceTable } from "./service-table";
import { Button } from "@/app/components/common";

type MainServicePageProps = {
  initialData: Array<Record<string, string>>;
};

export function MainServicePage({ initialData }: MainServicePageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [initialValue, setInitialValue] = useState<{
    id: string | null;
    isUpdate: boolean;
    name: string;
    branchId: string;
    price: string;
    status: string;
  }>({
    id: null,
    isUpdate: false,
    name: "",
    branchId: "",
    price: "",
    status: "Active",
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

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
            Service Management
          </h1>
          <p className="text-slate-600">
            Manage your laundry services and pricing
          </p>
        </div>
        <Button
          leftIcon={<Plus className="size-4" />}
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowModal(true)}
        >
          Add Service
        </Button>
      </div>

      <div className="relative mt-4 w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by service name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <ServiceTable
            initialData={initialData}
            search={debouncedSearch}
            onEdit={(service) => {
              setInitialValue({
                isUpdate: true,
                id: service?.id,
                branchId: service?.branch_id,
                price: service?.price,
                name: service?.name,
                status: service?.status,
              });
              setShowModal(true);
            }}
          />
        </div>
      </div>
      <ServiceModal
        initialValue={initialValue}
        showModal={showModal}
        onClose={() => {
          setInitialValue({
            id: null,
            isUpdate: false,
            name: "",
            branchId: "",
            price: "",
            status: "Active",
          });
          setShowModal(false);
        }}
      />
    </div>
  );
}
