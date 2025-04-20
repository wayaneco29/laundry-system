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
    <div className="-m-1.5 overflow-x-auto">
      <div className="p-1.5 min-w-full inline-block align-middle">
        <div className="border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-400">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-start text-xs font-medium text-white uppercase"
                >
                  Customer Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-start text-xs font-medium text-white uppercase"
                >
                  Branch
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-start text-xs font-medium text-white uppercase"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-start text-xs font-medium text-white uppercase"
                >
                  Date Ordered
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-start text-xs font-medium text-white uppercase"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-start text-xs font-medium text-white uppercase"
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders?.map((order, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {order?.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {order?.branchName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {order?.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {moment(order?.date_ordered).format("MMMM DD, YYYY h:mm A")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <EllipsisHorizontalIcon className="size-6 cursor-pointer hover:text-blue-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
