"use client";

import moment from "moment";
import { twMerge } from "tailwind-merge";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

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
    status: "Pending",
  },

  {
    customerName: "Selena Gomez",
    branchName: "Canturing",
    service: "Wash and Dry",
    date_ordered: getRandomDate(),
    status: "Picked Up",
  },
  {
    customerName: "Kate Green",
    branchName: "Liloan",
    service: "Wash and Dry, Fold",
    date_ordered: getRandomDate(),
    status: "Ready for Pickup",
  },
  {
    customerName: "David Pajulio",
    branchName: "Makati",
    service: "Wash and Dry",
    date_ordered: getRandomDate(),
    status: "Pending",
  },
];

export const OrdersTable = () => {
  return (
    <div className="relative overflow-auto rounded-sm">
      <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="group/head text-xs uppercase text-gray-700">
          <tr>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Customer Name
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Branch
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Service
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Date Ordered
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Status
            </th>
            <th className="right-0 bg-blue-400 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody className="group/body divide-y divide-gray-100">
          {orders?.map((order, index) => (
            <tr
              key={index}
              className="group/row hover:bg-gray-50 bg-white cursor-pointer"
            >
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                {order?.customerName}
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                {order?.branchName}
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                {order?.service}
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                {moment(order?.date_ordered).format("MMMM DD, YYYY")}
              </td>
              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                <span
                  className={twMerge(
                    "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white",
                    order?.status === "Picked Up" && "bg-green-500",
                    order?.status === "Pending" && "bg-blue-400",
                    order?.status === "Ready for Pickup" && "bg-yellow-500"
                  )}
                >
                  {order?.status}
                </span>
              </td>
              <td className="sticky right-0 bg-white px-3 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                <EllipsisHorizontalIcon className="size-8 mx-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
