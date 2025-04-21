"use client";

import { useState } from "react";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Input, Modal } from "@/app/components/common";
import { upsertCustomer } from "@/app/actions";
import { customerRevalidateTag } from "@/app/actions/customerRevalidateTag";

type MainCustomerPageProps = {
  customer_list: Array<Record<string, string>>;
};

export function MainCustomerPage({ customer_list }: MainCustomerPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const router = useRouter();

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      customer_id: null,
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      email: "",
      address: "",
    },
    resolver: yupResolver(
      Yup.object().shape({
        customer_id: Yup.string().nullable(),
        first_name: Yup.string().required("Customer Name is required"),
        middle_name: Yup.string(),
        last_name: Yup.string().required("Customer Name is required"),
        phone: Yup.string().required("Phone Number is required"),
        email: Yup.string().email("Email is invalid").notRequired(),
        address: Yup.string().required("Address is required"),
      })
    ),
  });

  const handleModalClose = () => {
    setShowModal(false);
    reset();
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Customers</h1>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          Add Customer
        </button>
      </div>
      <div className="mt-4">
        <div className="relative overflow-auto rounded-sm">
          <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="group/head text-xs uppercase text-gray-700">
              <tr>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Customer Name
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Phone Number
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Email
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Address
                </th>
              </tr>
            </thead>
            <tbody className="group/body divide-y divide-gray-100">
              {customer_list?.length ? (
                customer_list?.map((customer, index) => (
                  <tr
                    key={index}
                    onClick={() => {
                      customerRevalidateTag("getCustomer");
                      router.push(`/customers/${customer?.id}`);
                    }}
                    className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
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
      <Modal
        show={showModal}
        title="Add Customer"
        isSubmitting={isSubmitting}
        onClose={handleModalClose}
      >
        <Controller
          control={control}
          name="customer_id"
          render={() => <Input hidden />}
        />
        <div className="grid grid-cols-1 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="first_name"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="First Name"
                  placeholder="First Name"
                  error={!!errors.first_name}
                  {...field}
                />
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="middle_name"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Middle Name"
                  placeholder="Middle Name"
                  error={!!errors.middle_name}
                  {...field}
                />
              )}
            />
          </div>
          <div className="col-span-1">
            <Controller
              control={control}
              name="last_name"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Last Name"
                  placeholder="Last Name"
                  error={!!errors.last_name}
                  {...field}
                />
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="phone"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Phone Number"
                  placeholder="Phone Number"
                  error={!!errors.phone}
                  {...field}
                />
              )}
            />
          </div>
          <div className="col-span-1">
            <Controller
              control={control}
              name="email"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Email"
                  placeholder="Email"
                  error={!!errors?.email}
                  {...field}
                  value={field?.value || ""}
                />
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="address"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Address"
                  placeholder="Address"
                  error={!!errors?.address}
                  {...field}
                />
              )}
            />
          </div>
        </div>
        <div className="mt-8">
          <div className="flex justify-end items-center gap-x-2">
            <Button
              disabled={isSubmitting}
              className="bg-transparent text-blue-400 border focus:text-white focus border-blue-400 hover:bg-blue-400 hover:text-white"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleSubmit(async (newData) => {
                try {
                  const { error } = await upsertCustomer({
                    p_customer_id: newData?.customer_id || null,
                    p_first_name: newData?.first_name,
                    p_middle_name: newData?.middle_name,
                    p_last_name: newData?.last_name,
                    p_phone: newData?.phone,
                    p_email: newData?.email,
                    p_address: newData?.address,
                    p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
                  });

                  if (error) throw error;

                  handleModalClose();
                } catch (_error) {
                  console.error(_error);
                }
              })}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
