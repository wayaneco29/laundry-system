"use client";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { twMerge } from "tailwind-merge";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  History,
  Building2,
  Package,
} from "lucide-react";

import { Button, Input } from "@/app/components/common";
import { upsertCustomer } from "@/app/actions";
import { useRouter } from "next/navigation";
import { getRecentOrdersByCustomer } from "@/app/actions/order/get_order_analytics";
import { useEffect, useState } from "react";

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
  const router = useRouter();

  const {
    handleSubmit,
    control,
    reset,
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

  // Add state for recent transactions
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      setLoadingOrders(true);
      try {
        const { data } = await getRecentOrdersByCustomer(
          customer_info.customer_id,
          10
        );
        setRecentOrders(data || []);
      } catch (error) {
        setRecentOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchRecentOrders();
  }, [customer_info.customer_id]);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-gray-700 text-2xl font-medium">
              Customer Detail
            </h1>
            <p className="text-gray-500 text-sm">
              Manage customer information and view transaction history
            </p>
          </div>
        </div>
        <Button
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
      <div className="mt-4 text-gray-700">
        <div className="flex flex-col 2xl:flex-row gap-y-4 md:gap-y-8 2xl:gap-x-8">
          <div className="col-span-1 2xl:w-[800px]">
            <div className="bg-white rounded-md shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <User className="w-5 h-5" />
                  Personal Information
                </div>
                <Button
                  leftIcon={<Save className="w-4 h-4" />}
                  disabled={isSubmitting || !isDirty}
                  className="inline-flex items-center gap-2"
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

                      reset({
                        customer_id: data?.customer_id,
                        first_name: data?.first_name,
                        middle_name: data?.middle_name,
                        last_name: data?.last_name,
                        email: data?.email,
                        address: data?.address,
                      });
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
                      <div className="relative">
                        <Input
                          icon={<User />}
                          disabled={isSubmitting}
                          placeholder="Enter first name"
                          label="First Name"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="middle_name"
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          icon={<User />}
                          disabled={isSubmitting}
                          placeholder="Enter middle name"
                          label="Middle Name"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="last_name"
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          icon={<User />}
                          disabled={isSubmitting}
                          placeholder="Enter last name"
                          label="Last Name"
                          {...field}
                          className="pl-10"
                        />
                      </div>
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
                      <div className="relative">
                        <Input
                          icon={<Phone />}
                          disabled={isSubmitting}
                          placeholder="Enter phone number"
                          label="Phone Number"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          icon={<Mail />}
                          disabled={isSubmitting}
                          placeholder="Enter email address"
                          label="Email"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                <div className="col-span-1 lg:col-span-2">
                  <Controller
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          icon={<MapPin />}
                          disabled={isSubmitting}
                          placeholder="Enter full address"
                          label="Address"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 2xl:flex-1">
            <div className="bg-white rounded-md shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <History className="w-5 h-5" />
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
                      <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                        Services
                      </th>
                      <th className="w-28 text-center bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="group/body divide-y divide-gray-100">
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
                        >
                          <td className="text-nowrap px-6 py-4">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="text-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-blue-500" />
                              <div>
                                <div className="font-bold">
                                  {order.branch_name}
                                </div>
                                {/* You can add service info here if available */}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {order.items && order.items.length > 0 ? (
                              <ul className="list-disc pl-4">
                                {order.items.map((item: any, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-xs text-gray-700"
                                  >
                                    {item.name} x{item.quantity}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No services
                              </span>
                            )}
                          </td>
                          <td className="text-nowrap text-center px-6 py-4">
                            <span
                              className={twMerge(
                                "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium text-white",
                                order.status === "Picked up"
                                  ? "bg-green-500"
                                  : order.status === "Pending"
                                  ? "bg-blue-400"
                                  : "bg-yellow-500"
                              )}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
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
