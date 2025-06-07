"use client";

import moment from "moment";

import { Button } from "@/app/components/common";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

type MainOrderIdPageProps = {
  data: any;
};
export const MainOrderIdPage = ({ data }: MainOrderIdPageProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Order Details</h1>
        <Button className="mr-4" onClick={() => router.replace("/orders")}>
          <ArrowLongLeftIcon className="size-5" />
          Back
        </Button>
      </div>
      <div className="bg-white text-gray-600 p-8 rounded-md shadow-md">
        <div className="p-4">
          <div className="flex flex-col">
            <div className="w-full">
              <div className="text-2xl font-medium mb-4">Laundry Shop Inc.</div>
              <div className="font-bold text-lg mb-2 flex justify-between">
                <span>Order #</span> <span>{data?.order_id}</span>
              </div>
              <div className="font-medium text-lg text-gray-500 mb-2 flex justify-between">
                <span>Order Date</span>
                <span>{moment(data?.order_date).format("MMMM DD, YYYY")}</span>
              </div>
              <div className="font-medium text-lg text-gray-500 flex justify-between mb-2">
                <span>Order Branch</span> <span>{data?.branch_name}</span>
              </div>
              <div className="font-medium text-lg text-gray-500 flex justify-between mb-2">
                <span>Payment Status</span>{" "}
                <span
                  className={twMerge(
                    "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white",
                    data?.payment_status === "Paid" && "bg-green-500",
                    data?.payment_status === "Unpaid" && "bg-red-400"
                  )}
                >
                  {data?.payment_status}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="relative overflow-auto rounded-sm">
              <table className="table w-full">
                <thead className="group/head text-xs uppercase text-gray-700">
                  <tr>
                    <th className="text-start bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                      #
                    </th>
                    <th className="text-start bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                      Service
                    </th>
                    <th className="bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap w-60">
                      Price / KG
                    </th>
                    <th className="bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap w-40">
                      Quantity
                    </th>
                    <th className="bg-blue-400 px-6 py-4 bg-primary-500 text-white sticky top-0 z-10 text-nowrap w-40">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="relative group/body divide-y divide-gray-100">
                  {data?.items?.length ? (
                    data?.items?.map((items: any, index: number) => (
                      <tr
                        key={index}
                        className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
                      >
                        <td className="w-10 text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                          {index + 1}
                        </td>
                        <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                          {items?.name}
                        </td>
                        <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                          {items?.price}
                        </td>
                        <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                          {items?.quantity}
                        </td>
                        <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                          <strong>₱ {items?.total || 0}</strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <div className="table-row relative h-22">
                      <div className="absolute flex flex-col items-center justify-center inset-0">
                        No Services Added
                      </div>
                    </div>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between">
              <div className="flex gap-4">
                <Button>Pay Now</Button>
                <Button className="bg-green-500 hover:bg-green-600">
                  Print Receipt
                </Button>
              </div>
              <div className="text-xl font-bold">
                Gross Total ₱ {data?.total_price}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
