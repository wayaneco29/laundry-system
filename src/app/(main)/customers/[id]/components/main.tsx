"use client";

import { useForm, Controller } from "react-hook-form";

import { Button, Input } from "@/app/components/common";
import { twMerge } from "tailwind-merge";

type MainCustomerIdPageProps = {
  customer_info: {
    first_name: string;
    middle_name: string;
    last_name: string;
    phone: string;
    email: string;
    address: string;
  };
};

export const MainCustomerIdPage = ({
  customer_info,
}: MainCustomerIdPageProps) => {
  const { control } = useForm({
    defaultValues: customer_info,
  });
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="mt-4 text-gray-700">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-y-4 md:gap-y-8 2xl:gap-x-8">
          <div className="col-span-1">
            <div className="bg-white rounded-md shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-400 mb-4 font-medium">
                  Personal Information
                </div>
                <Button>Update</Button>
              </div>
              <div className="grid grid-cols-3 gap-x-2 mb-4">
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="first_name"
                    render={({ field }) => (
                      <Input
                        placeholder="First Name"
                        label="First Name"
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="middle_name"
                    render={({ field }) => (
                      <Input
                        placeholder="Middle Name"
                        label="Middle Name"
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="last_name"
                    render={({ field }) => (
                      <Input
                        placeholder="Last Name"
                        label="Last Name"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-2 mb-4">
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <Input
                        placeholder="Phone Number"
                        label="Phone Number"
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <Input placeholder="Email" label="Email" {...field} />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <Input placeholder="Address" label="Address" {...field} />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <div className="bg-white rounded-md shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-400 mb-4 font-medium">
                  Latest Transactions
                </div>
              </div>
              <div className="relative overflow-auto rounded-sm">
                <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="group/head text-xs uppercase text-gray-700">
                    <tr>
                      <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                        Date
                      </th>
                      <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                        Branch / Service
                      </th>
                      <th className="w-28 text-center bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="group/body divide-y divide-gray-100">
                    {/* {data?.map((customer, index) => (
                <tr
                  key={index}
                  onClick={() => router.push(`/customers/${customer?.id}`)}
                  className="group/row bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    {customer?.full_name}
                  </td>
                  <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    {customer?.phone}
                  </td>
                  <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    {customer?.email}
                  </td>
                  <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    {customer?.address}
                  </td>
                </tr>
              ))} */}
                    <tr className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200">
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        October 17, 2025
                      </td>
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        <div className="font-bold">Manduae City, Cebu</div>
                        <div className="mt-1">Wash, Dry and Fold</div>
                      </td>
                      <td className="text-nowrap text-center px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        <span
                          className={twMerge(
                            "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white bg-yellow-500"
                            // order?.status === "Picked Up" && "",
                            // order?.status === "Pending" && "bg-blue-400",
                            // order?.status === "Ready for Pickup" && "bg-yellow-500"
                          )}
                        >
                          Ongoing
                        </span>
                      </td>
                    </tr>
                    <tr className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200">
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        January 17, 2024
                      </td>
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        <div className="font-bold">
                          Brgy. Sambag 2, Colon, Cebu
                        </div>
                        <div className="mt-1">Wash, Dry and Fold</div>
                      </td>
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        <span
                          className={twMerge(
                            "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white bg-green-500"
                            // order?.status === "Picked Up" && "",
                            // order?.status === "Pending" && "bg-blue-400",
                            // order?.status === "Ready for Pickup" && "bg-yellow-500"
                          )}
                        >
                          Picked up
                        </span>
                      </td>
                    </tr>
                    <tr className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200">
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        January 17, 2024
                      </td>
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        <div className="font-bold">
                          Brgy. Sambag 2, Colon, Cebu
                        </div>
                        <div className="mt-1">Wash, Dry and Fold</div>
                      </td>
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        <span
                          className={twMerge(
                            "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white bg-green-500"
                            // order?.status === "Picked Up" && "",
                            // order?.status === "Pending" && "bg-blue-400",
                            // order?.status === "Ready for Pickup" && "bg-yellow-500"
                          )}
                        >
                          Picked up
                        </span>
                      </td>
                    </tr>
                    <tr className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200">
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        January 17, 2024
                      </td>
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        <div className="font-bold">
                          Brgy. Sambag 2, Colon, Cebu
                        </div>
                        <div className="mt-1">Wash, Dry and Fold</div>
                      </td>
                      <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                        <span
                          className={twMerge(
                            "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  text-white bg-green-500"
                            // order?.status === "Picked Up" && "",
                            // order?.status === "Pending" && "bg-blue-400",
                            // order?.status === "Ready for Pickup" && "bg-yellow-500"
                          )}
                        >
                          Picked up
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
