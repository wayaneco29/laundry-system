"use client";

import moment from "moment";
import { twMerge } from "tailwind-merge";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

const getRandomDate = () => {
  const today = new Date();
  const randomOffset = Math.floor(Math.random() * 30);
  const randomDate = new Date(today);
  randomDate.setDate(today.getDate() - randomOffset);
  return randomDate;
};

const orders = [
  {
    customerName: "John Cena",
    branchName: "Liloan",
    service: "Wash and Dry",
    date_ordered: getRandomDate(),
    payment_satus: "Paid",
    status: "Pending",
  },

  {
    customerName: "Selena Gomez",
    branchName: "Canturing",
    service: "Wash and Dry",
    date_ordered: getRandomDate(),
    payment_satus: "Paid",
    status: "Picked Up",
  },
  {
    customerName: "Kate Green",
    branchName: "Liloan",
    service: "Wash and Dry, Fold",
    date_ordered: getRandomDate(),
    payment_satus: "Unpaid",
    status: "Ready for Pickup",
  },
  {
    customerName: "David Pajulio",
    branchName: "Makati",
    service: "Wash and Dry",
    date_ordered: getRandomDate(),
    payment_satus: "Paid",
    status: "Pending",
  },
];

type OrdersTableProps = {
  data: Array<any>;
};

export const OrdersTable = ({ data }: OrdersTableProps) => {
  const router = useRouter();

  return (
    <div className="relative overflow-auto rounded-sm">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="group/head text-xs uppercase text-gray-700">
          <tr>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Order ID
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Customer Name
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Branch
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Order Status
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Payment Status
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Date Ordered
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="group/body divide-y divide-gray-100">
          {data?.map((order, index) => (
            <tr
              key={index}
              className="group/row hover:bg-gray-50 bg-white cursor-pointer"
              onClick={() => router.push(`/orders/${order?.order_id}`)}
            >
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                {order?.order_id}
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                {order?.customer_name}
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                {order?.branch_name}
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                <span
                  className={twMerge(
                    "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white",
                    order?.order_status === "Pending" && "bg-blue-500",
                    order?.order_status === "Paid" && "bg-green-500",
                    order?.order_status === "Unpaid" && "bg-red-400"
                  )}
                >
                  {order?.order_status}
                </span>
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                <span
                  className={twMerge(
                    "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white",
                    order?.payment_status === "Paid" && "bg-green-500",
                    order?.payment_status === "Unpaid" && "bg-red-400"
                  )}
                >
                  {order?.payment_status}
                </span>
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                {moment(order?.date_ordered).format("MMMM DD, YYYY")}
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                <strong>{order?.total_price}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
