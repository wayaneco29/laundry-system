"use client";

import { useState } from "react";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Input, Modal } from "@/app/components/common";

import { upsertBranch } from "@/app/actions/branch/upsert_branch";

type BranchesPageProps = {
  branch_list: Array<Record<string, string>>;
};

export function MainBranchesPage({ branch_list }: BranchesPageProps) {
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
      id: null,
      name: "",
      description: "",
      address: "",
    },
    resolver: yupResolver(
      Yup.object().shape({
        isUpdate: Yup.boolean(),
        id: Yup.string().nullable(),
        name: Yup.string().required("Branch is required"),
        description: Yup.string().required("First Name is required"),
        address: Yup.string().required("Address is required"),
      })
    ),
  });

  console.log({ branch_list });

  const isUpdate = watch("isUpdate");

  const handleModalClose = () => {
    setShowModal(false);
    reset({
      isUpdate: false,
      id: null,
      name: "",
      description: "",
      address: "",
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Branches</h1>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          Add Branch
        </button>
      </div>
      <div className="mt-4">
        <div className="relative overflow-auto rounded-sm">
          <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="group/head text-xs uppercase text-gray-700">
              <tr>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Branch
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Description
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Address
                </th>
              </tr>
            </thead>
            <tbody className="group/body divide-y divide-gray-100">
              {branch_list?.length ? (
                branch_list?.map((branch, index) => (
                  <tr
                    key={index}
                    className="group/row hover:bg-gray-50 bg-white cursor-pointer"
                    onClick={() => {
                      reset({
                        isUpdate: true,
                        id: branch?.branch_id,
                        name: branch?.name,
                        description: branch?.description,
                        address: branch?.address,
                      });

                      setShowModal(true);
                    }}
                  >
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {branch?.name}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {branch?.description}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {branch?.address}
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
        title={isUpdate ? "Update Branch" : "Add Branch"}
        isSubmitting={isSubmitting}
        onClose={handleModalClose}
      >
        <Controller
          control={control}
          name="id"
          render={() => <Input hidden />}
        />
        <div className="grid grid-cols-1 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="name"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Branch Name"
                  placeholder="Branch Name"
                  error={!!errors.name}
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
              name="description"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Description"
                  placeholder="Description"
                  error={!!errors.description}
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
                  error={!!errors.address}
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
                  console.log(newData);
                  const { error } = await upsertBranch({
                    p_branch_id: newData?.id || null,
                    p_name: newData?.name,
                    p_description: newData?.description,
                    p_address: newData?.address,
                    p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
                  });
                  console.log(error);

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
