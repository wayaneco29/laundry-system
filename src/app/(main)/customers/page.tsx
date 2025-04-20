"use client";

import { useEffect, useState } from "react";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Input, Modal } from "@/app/components/common";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import { CUSTOMERS_KEY } from "@/app/constants";

const defaultValues = [
  {
    customerName: "Aira Combate",
    phoneNumber: "+63923123456",
    email: "just_simple@gmail.com",
    address: "Mabini, Macrohon, Southern Leyte",
  },
  {
    customerName: "Zyrus Cruz",
    phoneNumber: "+63944970889",
    email: "zyrus_02@gmail.com",
    address: "Barangay Tisa, Cebu City, Cebu",
  },
  {
    customerName: "Marta Agila",
    phoneNumber: "+639557811009",
    email: "",
    address: "Mandaue City, Cebu",
  },
];

export default function CustomerPage() {
  const [customers, setCustomers] =
    useState<Array<Record<string, string>>>(defaultValues);
  const [showModal, setShowModal] = useState<boolean>(false);

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      email: "",
      address: "",
    },
    resolver: yupResolver(
      Yup.object().shape({
        customerName: Yup.string().required("Customer Name is required"),
        phoneNumber: Yup.string().required("Phone Number is required"),
        email: Yup.string()
          .email("Email is invalid")
          .required("Email is required"),
        address: Yup.string().required("Address is required"),
      })
    ),
  });

  const handleModalClose = () => {
    setShowModal(false);
    reset();
  };

  useEffect(() => {
    const localData = localStorage.getItem(CUSTOMERS_KEY);
    if (localData) {
      setCustomers(JSON.parse(localData));
    } else {
      setCustomers(defaultValues);
    }
  }, []);

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
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Customer Name
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Phone Number
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Email
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Address
                </th>
                <th className="right-0 bg-blue-400 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="group/body divide-y divide-gray-100">
              {customers?.map((customer, index) => (
                <tr
                  key={index}
                  className="group/row hover:bg-gray-50 bg-white cursor-pointer"
                >
                  <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    {customer?.customerName}
                  </td>
                  <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    {customer?.phoneNumber}
                  </td>
                  <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    {customer?.email}
                  </td>
                  <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    {customer?.address}
                  </td>
                  <td className="sticky right-0 bg-white px-3 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                    <EllipsisHorizontalIcon className="size-8 mx-auto" />
                  </td>
                </tr>
              ))}
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
        <div className="grid grid-cols-1 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="customerName"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Customer Name"
                  placeholder="Customer Name"
                  error={!!errors.customerName}
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
              name="phoneNumber"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Phone Number"
                  placeholder="Phone Number"
                  error={!!errors.phoneNumber}
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
              onClick={handleSubmit(async (data) => {
                try {
                  const newData = [
                    ...customers,
                    {
                      customerName: data?.customerName,
                      phoneNumber: data?.phoneNumber,
                      email: data?.email,
                      address: data?.address,
                    },
                  ];
                  const mockPromise = new Promise((resolve) => {
                    setTimeout(() => {
                      setCustomers(newData);
                      localStorage.setItem(
                        CUSTOMERS_KEY,
                        JSON.stringify(newData)
                      );
                      resolve(true);
                    }, 3000);
                  });

                  await mockPromise;

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
