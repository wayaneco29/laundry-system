"use client";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { twMerge } from "tailwind-merge";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Input } from "@/app/components/common";
import { upsertCustomer } from "@/app/actions";

type MainCustomerIdPageProps = {
  customer_info: {
    customer_id: string;
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
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty },
  } = useForm({
    defaultValues: customer_info,
    resolver: yupResolver(
      Yup.object().shape({
        customer_id: Yup.string().nullable(),
        first_name: Yup.string().required("First Name is required"),
        middle_name: Yup.string(),
        last_name: Yup.string().required("Last Name is required"),
        phone: Yup.string().required("Phone Number is required"),
        email: Yup.string().email("Email is invalid"),
        address: Yup.string().required("Address is required"),
      })
    ),
  });

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Customer Detail</h1>
      </div>
      <div className="mt-4 text-gray-700">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-y-4 md:gap-y-8 2xl:gap-x-8">
          <div className="col-span-1">
            <div className="bg-white rounded-md shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-400 mb-4 font-medium">
                  Personal Information
                </div>
                <Button
                  disabled={isSubmitting || !isDirty}
                  onClick={handleSubmit(async (data) => {
                    try {
                      const { error } = await upsertCustomer({
                        p_customer_id: data?.customer_id as string,
                        p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
                        p_first_name: data?.first_name,
                        p_middle_name: data?.middle_name,
                        p_last_name: data?.last_name,
                        p_phone: data?.phone,
                        p_email: data?.email || "",
                        p_address: data?.address,
                      });

                      if (error) throw error;
                    } catch (error) {
                      console.error(error);
                    }
                  })}
                >
                  Update
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-x-4 mb-4">
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="first_name"
                    render={({ field }) => (
                      <Input
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                        placeholder="Last Name"
                        label="Last Name"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-y-4 lg:gap-x-4 mb-4">
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <Input
                        disabled={isSubmitting}
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
                      <Input
                        disabled={isSubmitting}
                        placeholder="Email"
                        label="Email"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <Input
                        disabled={isSubmitting}
                        placeholder="Address"
                        label="Address"
                        {...field}
                      />
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
