"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, MapPin, Plus, Eye } from "lucide-react";

import { customerRevalidateTag } from "@/app/actions";
import { UpsertCustomerModal } from "./upsert-customer-modal";

type MainCustomerPageProps = {
  customer_list: Array<Record<string, string>>;
};

export function MainCustomerPage({ customer_list }: MainCustomerPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);

  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Customers</h1>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>
      <div className="mt-4">
        <div className="relative overflow-auto rounded-sm">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="group/head text-xs uppercase text-gray-700">
              <tr>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap text-center">
                  #
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Customer Details
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap text-center">
                  Phone
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap text-center">
                  Email
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap"></th>
              </tr>
            </thead>
            <tbody className="group/body divide-y divide-gray-100">
              {customer_list?.length ? (
                customer_list?.map((customer, index) => (
                  <tr key={index} className="group/row bg-white hover:bg-gray-50">
                    <td className="w-10 text-center text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {index + 1}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {customer?.full_name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-xs">
                              {customer?.address}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {customer?.customer_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{customer?.phone}</span>
                      </div>
                    </td>
                    <td className="text-center text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{customer?.email || "N/A"}</span>
                      </div>
                    </td>
                    <td className="text-center w-20 text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      <button
                        className="inline-flex items-center gap-1 font-bold text-blue-500 hover:text-blue-600 cursor-pointer"
                        onClick={() => {
                          customerRevalidateTag("getCustomer");
                          router.push(`/customers/${customer?.customer_id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <User className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">No customers found</p>
                      <p className="text-gray-400 text-sm">Get started by adding your first customer</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <UpsertCustomerModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
