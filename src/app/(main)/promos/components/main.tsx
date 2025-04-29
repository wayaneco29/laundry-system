"use client";

import { useState } from "react";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Datepicker, Input, Modal } from "@/app/components/common";
import { customerRevalidateTag } from "@/app/actions";
import moment from "moment";
import { BranchProvider } from "@/app/providers";

type MainPromoPageProps = {
  promo_list: Array<Record<string, string>>;
};

export function MainPromoPage({ promo_list }: MainPromoPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const router = useRouter();

  const {
    reset,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty, errors },
  } = useForm({
    defaultValues: {
      id: null,
      name: "",
      code: "",
      description: "",
      valid_until: "",
      branches: [],
    },
    resolver: yupResolver(
      Yup.object().shape({
        id: Yup.string().nullable(),
        name: Yup.string().required("First Name is required"),
        code: Yup.string(),
        description: Yup.string().required("Last Name is required"),
        valid_until: Yup.string().required("Phone Number is required"),
        branches: Yup.array().of(Yup.string()).min(1, "This field is required"),
      })
    ),
  });

  console.log(errors);
  console.log("branches", watch("branches"));

  const handleModalClose = () => {
    setShowModal(false);
    reset();
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Promos</h1>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          Add Promo
        </button>
      </div>
      <div className="mt-4">
        <div className="relative overflow-auto rounded-sm">
          <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="group/head text-xs uppercase text-gray-700">
              <tr>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Name
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Code
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Description
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Valid Until
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Branches
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="group/body divide-y divide-gray-100">
              {promo_list?.length ? (
                promo_list?.map((promo, index) => (
                  <tr
                    key={index}
                    onClick={() => {
                      customerRevalidateTag("getCustomer");
                      router.push(`/customers/${promo?.id}`);
                    }}
                    className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
                  >
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {promo?.name}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {promo?.code}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {promo?.description}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {moment(promo?.valid_until).format("MMMM DD, YYYY")}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {promo?.branches}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {promo?.status}
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
        title="Add Promo"
        isSubmitting={isSubmitting}
        onClose={handleModalClose}
      >
        <Controller
          control={control}
          name="id"
          render={() => <Input hidden />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="name"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Name"
                  placeholder="Name"
                  error={!!errors.name}
                  {...field}
                />
              )}
            />
          </div>
          <div className="col-span-1">
            <Controller
              control={control}
              name="code"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={isSubmitting}
                  label="Code"
                  placeholder="Code"
                  error={!!errors.code}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 mb-4">
          <div className="col-span-1">
            <Controller
              control={control}
              name="valid_until"
              render={({ field, formState: { errors } }) => (
                <Datepicker
                  disabled={isSubmitting}
                  label="Valid Until"
                  placeholder="Valid Until"
                  error={!!errors.valid_until}
                  {...field}
                />
              )}
            />
          </div>
          <div className="col-span-1">
            <Controller
              control={control}
              name="valid_until"
              render={({ field, formState: { errors } }) => (
                <Datepicker
                  disabled={isSubmitting}
                  label="Valid Until"
                  placeholder="Valid Until"
                  error={!!errors.valid_until}
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
              name="branches"
              render={({
                field: { value = [], onChange, ...field },
                formState: { errors },
              }) => (
                <BranchProvider
                  isMulti={true}
                  disabled={isSubmitting}
                  label="Branches"
                  placeholder="Branches"
                  error={!!errors?.branches}
                  {...field}
                  value={value as Array<string>}
                  onChange={(newValue) => {
                    // const branchIds = (
                    //   Array.isArray(newValue) ? newValue : []
                    // )?.map(({ value: xValue }: { value: string }) => xValue);

                    onChange(newValue);
                  }}
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
                  // const { error } = await upsertCustomer({
                  //   p_customer_id: newData?.customer_id || null,
                  //   p_first_name: newData?.first_name,
                  //   p_middle_name: newData?.middle_name,
                  //   p_last_name: newData?.last_name,
                  //   p_phone: newData?.phone,
                  //   p_email: newData?.email || "",
                  //   p_address: newData?.address,
                  //   p_staff_id: "ed541d2d-bc64-4a03-b4b9-e122310c661c",
                  // });
                  // if (error) throw error;
                  // handleModalClose();
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
