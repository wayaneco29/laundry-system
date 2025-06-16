"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { ServiceModal } from "./service-modal";
import { ServiceTable } from "./service-table";

type MainServicePageProps = {
  services_list: Array<Record<string, string>>;
};

export function MainServicePage({ services_list }: MainServicePageProps) {
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
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-100 text-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          <Plus className="size-4" /> Add Service
        </button>
      </div>
      <div className="mt-4">
        <div className="flex flex-col">
          <ServiceTable
            data={services_list}
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
