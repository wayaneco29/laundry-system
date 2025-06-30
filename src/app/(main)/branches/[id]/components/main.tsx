"use client";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Input, Modal } from "@/app/components/common";
import { upsertBranchStocks } from "@/app/actions";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { upsertBranch } from "@/app/actions/branch/upsert_branch";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { useState } from "react";

type StockType = {
  id: string | null;
  name: string;
  quantity: string;
};

type MainBranchIDPageProps = {
  branch_info: {
    id: string;
    name: string;
    description: string;
    address: string;
    branch_stocks: Array<StockType>;
  };
};

export const MainBranchIDPage = ({ branch_info }: MainBranchIDPageProps) => {
  const router = useRouter();
  const { userId } = useCurrentUser();

  const [showStockModal, setShowStockModal] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      id: branch_info?.id,
      name: branch_info?.name,
      description: branch_info?.description,
      address: branch_info?.address,
    },
    resolver: yupResolver(
      Yup.object().shape({
        id: Yup.string(),
        name: Yup.string().required(),
        description: Yup.string().required(),
        address: Yup.string().required(),
      })
    ),
  });

  const stockMethods = useForm({
    defaultValues: {
      id: null,
      name: "",
      quantity: "",
      branch_id: branch_info?.id,
    },
    resolver: yupResolver(
      Yup.object().shape({
        id: Yup.string().nullable(),
        name: Yup.string().required(),
        quantity: Yup.string().required(),
        branch_id: Yup.string(),
      })
    ),
  });

  const handleModalClose = () => {
    setShowStockModal(false);

    stockMethods.reset({
      id: null,
      name: "",
      quantity: "",
      branch_id: branch_info?.id,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-gray-700 text-2xl font-medium">Branch Detail</h1>
        <Button
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          leftIcon={<ArrowLongLeftIcon className="size-5" />}
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
      <div className="mt-4 text-gray-700">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-y-4 md:gap-y-8 2xl:gap-x-8">
          <div className="col-span-1">
            <div className="bg-white rounded-md shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-400 mb-4 font-medium">
                  Branch Information
                </div>
                <Button
                  disabled={isSubmitting || !isDirty}
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmit(async (data) => {
                    try {
                      const { error } = await upsertBranch({
                        p_branch_id: branch_info?.id,
                        p_name: data?.name,
                        p_description: data?.description,
                        p_address: data?.address,
                        p_staff_id: userId!, // Use authenticated user ID
                      });

                      if (error) throw error;

                      reset({
                        id: branch_info?.id,
                        name: data?.name,
                        description: data?.description,
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-x-4 mb-4">
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        disabled={isSubmitting}
                        placeholder="Branch Name"
                        label="Branch Name"
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <Input
                        disabled={isSubmitting}
                        placeholder="Description"
                        label="Description"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1">
                <div className="col-span-1">
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
            <div className="bg-white rounded-md shadow-md p-4 mt-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-600 mb-4 font-medium">Inventory</div>
                <Button onClick={() => setShowStockModal(true)}>
                  Add Item
                </Button>
              </div>
              <div className="grid grid-cols-1">
                <div className="col-span-1">
                  <div className="relative overflow-auto rounded-sm">
                    <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
                    <table className="w-full text-left text-sm text-gray-500">
                      <thead className="group/head text-xs uppercase text-gray-700">
                        <tr>
                          <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                            Stock Name
                          </th>
                          <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-0 text-nowrap">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="group/body divide-y divide-gray-100">
                        {branch_info?.branch_stocks?.length ? (
                          branch_info?.branch_stocks?.map((stock) => (
                            <tr
                              key={stock?.id}
                              className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
                              onClick={() => {
                                stockMethods?.reset({
                                  id: stock?.id,
                                  name: stock?.name,
                                  quantity: stock?.quantity,
                                  branch_id: branch_info?.id,
                                });

                                setShowStockModal(true);
                              }}
                            >
                              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                                {stock?.name}
                              </td>
                              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                                {stock?.quantity}
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
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={showStockModal}
        title={true ? "Update Inventory" : "Add Inventory"}
        isSubmitting={stockMethods?.formState?.isSubmitting}
        onClose={handleModalClose}
      >
        <Controller
          control={stockMethods?.control}
          name="id"
          render={() => <Input hidden />}
        />
        <div className="grid grid-cols-1 mb-4">
          <div className="col-span-1">
            <Controller
              control={stockMethods?.control}
              name="name"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={stockMethods?.formState?.isSubmitting}
                  label="Item Name"
                  placeholder="Item Name"
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
              control={stockMethods?.control}
              name="quantity"
              render={({ field, formState: { errors } }) => (
                <Input
                  disabled={stockMethods?.formState?.isSubmitting}
                  label="Quantity"
                  placeholder="Quantity"
                  error={!!errors.quantity}
                  {...field}
                  onChange={(event) => {
                    const newValue = event?.target?.value?.replace(/\D/g, "");

                    field?.onChange(newValue);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className="mt-8">
          <div className="flex justify-end items-center gap-x-2">
            <Button
              disabled={stockMethods?.formState?.isSubmitting}
              className="bg-transparent text-blue-400 border focus:text-white focus border-blue-400 hover:bg-blue-400 hover:text-white"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              disabled={
                stockMethods?.formState?.isSubmitting ||
                !stockMethods?.formState?.isDirty
              }
              onClick={stockMethods?.handleSubmit(async (newData) => {
                try {
                  const result = await upsertBranchStocks({
                    branchId: branch_info?.id,
                    stocks: [
                      {
                        id: newData?.id || crypto.randomUUID(),
                        name: newData?.name,
                        quantity: Number(newData?.quantity),
                      },
                    ],
                  });

                  if (!result.success) throw new Error(result.message);

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
};
