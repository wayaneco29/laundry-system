"use client";

import { useState } from "react";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Input, Modal } from "@/app/components/common";

import { upsertStaff } from "@/app/actions";

type MainStaffPageProps = {
  staff_list: Array<Record<string, string>>;
};

export function MainStaffPage({ staff_list }: MainStaffPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);

  const {
    reset,
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      isUpdate: false,
      branch: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      email: "",
      address: "",
    },
    resolver: yupResolver(
      Yup.object().shape({
        isUpdate: Yup.boolean(),
        staff_id: Yup.string().nullable(),
        branch: Yup.string().required("Branch is required"),
        first_name: Yup.string().required("First Name is required"),
        middle_name: Yup.string(),
        last_name: Yup.string().required("Last Name is required"),
        phone: Yup.string().required("Phone Number is required"),
        email: Yup.string().email("Email is invalid").notRequired(),
        address: Yup.string().required("Address is required"),
      })
    ),
  });

  const isUpdate = watch("isUpdate");

  const handleModalClose = () => {
    setShowModal(false);
    reset({
      isUpdate: false,
      staff_id: null,
      branch: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Staffs</h1>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          Add Staff
        </button>
      </div>
      <div className="mt-4">
        <div className="relative overflow-auto rounded-sm">
          <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="group/head text-xs uppercase text-gray-700">
              <tr>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Staff Name
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Branch
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
              {staff_list?.length ? (
                staff_list?.map((staff, index) => (
                  <tr
                    key={index}
                    className="group/row hover:bg-gray-50 bg-white cursor-pointer"
                    onClick={() => {
                      reset({
                        isUpdate: true,
                        branch: "25ff64ce-2610-4b48-a9ed-468bb0d803f3",
                        staff_id: staff?.staff_id,
                        first_name: staff?.first_name,
                        middle_name: staff?.middle_name,
                        last_name: staff?.last_name,
                        phone: staff?.phone,
                        email: staff?.email,
                        address: staff?.address,
                      });

                      setShowModal(true);
                    }}
                  >
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.full_name}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.branch}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.phone}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.email}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.address}
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
        title={isUpdate ? "Update Staff" : "Add Staff"}
        isSubmitting={isSubmitting}
        onClose={handleModalClose}
      >
        <Controller
          control={control}
          name="staff_id"
          render={() => <Input hidden />}
        />
        <div className="grid grid-cols-1 gap-x-2 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="branch"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Branch"
                  placeholder="Branch"
                  error={!!errors.branch}
                  {...field}
                />
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-2 mb-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 mb-4">
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
                  error={!!errors?.last_name}
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
              disabled={isSubmitting || !isDirty}
              onClick={handleSubmit(async (newData) => {
                try {
                  const { error } = await upsertStaff({
                    p_staff_id: newData?.staff_id || null,
                    // p_branch_id: newData?.branch,
                    p_branch_id: "25ff64ce-2610-4b48-a9ed-468bb0d803f3",
                    p_first_name: newData?.first_name,
                    p_middle_name: newData?.middle_name,
                    p_last_name: newData?.last_name,
                    p_phone: newData?.phone,
                    p_email: newData?.email || "",
                    p_address: newData?.address,
                    p_created_by: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
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
