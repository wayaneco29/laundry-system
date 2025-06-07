"use client";

import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { PlusIcon } from "@heroicons/react/20/solid";

import { ServiceModal } from "./service-modal";

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
        <h1 className="text-gray-700 text-2xl font-medium">Services</h1>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon className="h-5 w-5" /> Add Service
        </button>
      </div>
      <div className="mt-4">
        <div className="relative overflow-auto rounded-sm">
          <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="group/head text-xs uppercase text-gray-700">
              <tr>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Service Name
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Price / KL
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="group/body divide-y divide-gray-100">
              {services_list?.length ? (
                services_list?.map((promo, index) => (
                  <tr
                    key={index}
                    onClick={() => {
                      setInitialValue({
                        isUpdate: true,
                        id: promo?.id,
                        branchId: promo?.branch_id,
                        price: promo?.price,
                        name: promo?.name,
                        status: promo?.status,
                      });
                      setShowModal(true);
                    }}
                    className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
                  >
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {promo?.name}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {promo?.price}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      <span
                        className={twMerge(
                          "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white",
                          promo?.status === "Active" && "bg-green-500",
                          promo?.status === "Inactive" && "bg-red-400"
                        )}
                      >
                        {promo?.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <div className="table-row relative h-15 border border-gray-200">
                  <div className="absolute flex items-center justify-center inset-0">
                    NO DATA
                  </div>
                </div>
              )}
            </tbody>
          </table>
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
