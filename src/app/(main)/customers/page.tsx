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
        <div className="flex flex-col">
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
                        Phone Number
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-start text-xs font-medium text-white uppercase"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-start text-xs font-medium text-white uppercase"
                      >
                        Address
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
                    {customers?.map((customer, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          {customer.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {customer?.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {customer?.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {customer.address}
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
