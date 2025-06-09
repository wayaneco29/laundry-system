"use client";

import moment from "moment";
import { twMerge } from "tailwind-merge";

import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { Dropdown } from "./common";
import { updatePaymentStatus } from "../actions";

type OrdersTableProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<any>;
};

export const OrdersTable = ({ data }: OrdersTableProps) => {
  const router = useRouter();

  // const handleUpdateOrderStatus = async (
  //   p_order_id: string,
  //   p_order_status: string
  // ) => {
  //   try {
  //     const { error } = await updateOrderStatus({
  //       p_order_id,
  //       p_order_status,
  //       p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
  //     });

  //     if (error) throw error;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleUpdatePaymentStatus = async (
    p_order_id: string,
    p_payment_status: string
  ) => {
    try {
      const { error } = await updatePaymentStatus({
        p_order_id,
        p_payment_status,
        p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
      });

      if (error) throw error;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative overflow-auto rounded-sm">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="group/head text-xs uppercase text-gray-700">
          <tr>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap text-center">
              #
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
              Order Details
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap text-center">
              Branch
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap text-center">
              Payment Status
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap text-center">
              Amount
            </th>
            <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap"></th>
          </tr>
        </thead>
        <tbody className="group/body divide-y divide-gray-100">
          {!!data?.length ? (
            data?.map((order, index) => (
              <tr key={index} className="group/row bg-white">
                <td className="w-10 text-center text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                  {index + 1}
                </td>
                <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                  <div>
                    Name:
                    <span className="font-bold ml-3">
                      {order?.customer_name}
                    </span>
                  </div>
                  <div>
                    Date:
                    <span className="font-bold ml-3">
                      {moment(order?.date_ordered).format("MMMM DD, YYYY")}
                    </span>
                  </div>
                  <div>
                    ID:
                    <span className="font-bold ml-3">{order?.order_id}</span>
                  </div>
                  <div>
                    Status:
                    <span
                      className={twMerge(
                        "font-bold ml-3",
                        order?.order_status === "Pending" && "text-blue-500",
                        order?.order_status === "Ongoing" && "text-pink-500",
                        order?.order_status === "Ready for Pickup" &&
                          "text-yellow-500",
                        order?.order_status === "Picked up" && "text-green-500"
                      )}
                    >
                      {order?.order_status}
                    </span>
                  </div>
                </td>
                <td className="text-center text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                  {order?.branch_name}
                </td>
                <td className="text-center text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                  <Dropdown
                    className={
                      order?.payment_satus === "Paid"
                        ? "pointer-events-none"
                        : ""
                    }
                  >
                    <Dropdown.Button
                      className={
                        order?.payment_status === "Paid" ? "cursor-default" : ""
                      }
                    >
                      <span
                        className={twMerge(
                          "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white",
                          order?.payment_status === "Paid" && "bg-green-500",
                          order?.payment_status === "Unpaid" && "bg-red-400"
                        )}
                      >
                        {order?.payment_status}
                        {order?.payment_satus === "Unpaid" && (
                          <ChevronUpDownIcon className="text-white size-5" />
                        )}
                      </span>
                    </Dropdown.Button>
                    <Dropdown.Group containerClassName="min-w-28 rounded-sm">
                      <div
                        className="px-4 py-2 cursor-pointer"
                        onClick={() =>
                          handleUpdatePaymentStatus(order?.order_id, "Paid")
                        }
                      >
                        Paid
                      </div>
                    </Dropdown.Group>
                  </Dropdown>
                </td>
                <td className="text-center text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                  <strong>₱ {order?.total_price}</strong>
                </td>
                <td className="text-center w-20 text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                  <span
                    className="font-bold text-blue-500 cursor-pointer"
                    onClick={() => router.push(`/orders/${order?.order_id}`)}
                  >
                    VIEW
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <div className="table-row relative h-22">
              <div className="absolute flex flex-col items-center justify-center inset-0">
                Empty
              </div>
            </div>
          )}
        </tbody>
      </table>
    </div>
  );
};
