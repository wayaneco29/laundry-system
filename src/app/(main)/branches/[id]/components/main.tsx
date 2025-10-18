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
import { ArrowLeft } from "lucide-react";

type StockType = {
  branch_stock_id: string;
  stock_id: string;
  stock_name: string;
  branch_id: string;
  branch_name: string;
  quantity: number;
};

type MainBranchIDPageProps = {
  branch_info: {
    id: string;
    name: string;
    description: string;
    address: string;
    stocks: Array<StockType>;
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

  const watchStockId = stockMethods?.watch("id", null);

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
      <button
        onClick={() => router.replace("/branches")}
        className="inline-flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-base min-h-[44px] w-fit active:scale-95 transition-transform"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Branches</span>
      </button>
      <div className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Branch Detail
        </h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">
          View and manage branch information
        </p>
      </div>
      <div className="mt-4 text-gray-700">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-y-4 md:gap-y-8 2xl:gap-x-8">
          <div className="col-span-1">
            <div className="bg-white rounded-md shadow-md overflow-hidden">
              <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="text-white font-medium">Branch Information</div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-x-4 mb-4 px-6">
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
              <div className="grid grid-cols-1 px-6 pb-6">
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

              <div className="px-6 mb-6">
                <Button
                  disabled={isSubmitting || !isDirty}
                  className="cursor-pointer active:scale-95 focus:!ring-0"
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
            </div>
          </div>
          <div className="col-span-1">
            <div className="bg-white rounded-md shadow-md overflow-hidden mt-5 xl:mt-0">
              <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="text-white font-medium">Inventory</div>
              </div>
              <div className="grid grid-cols-1">
                <div className="col-span-1">
                  <div className="relative overflow-auto rounded-sm">
                    <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
                    <table className="w-full text-left text-sm text-gray-500">
                      <thead className="group/head text-xs uppercase text-gray-700">
                        <tr>
                          <th className="px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-black sticky top-0 z-0 text-nowrap">
                            Stock Name
                          </th>
                          <th className="px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-black sticky top-0 z-0 text-nowrap w-20">
                            Quantity
                          </th>
                          <th className="sr-only"></th>
                        </tr>
                      </thead>
                      <tbody className="group/body divide-y divide-gray-100">
                        {branch_info?.stocks?.length ? (
                          branch_info?.stocks?.map((stock) => (
                            <tr
                              key={stock?.stock_id}
                              className="group/row bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
                              onClick={() => {
                                stockMethods?.reset({
                                  id: stock?.stock_id,
                                  name: stock?.stock_name,
                                  quantity: stock?.quantity.toString(),
                                  branch_id: branch_info?.id,
                                });

                                setShowStockModal(true);
                              }}
                            >
                              <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                                {stock?.stock_name}
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
              <div className="p-6">
                <Button
                  className="cursor-pointer active:scale-95 focus:!ring-0"
                  onClick={() => setShowStockModal(true)}
                >
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={showStockModal}
        title={watchStockId ? "Update Inventory" : "Add Inventory"}
        isSubmitting={stockMethods?.formState?.isSubmitting}
        onClose={handleModalClose}
      >
        <Controller
          control={stockMethods?.control}
          name="id"
          render={() => <Input containerClassName="!hidden" />}
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
              className="bg-transparent text-blue-600 border border-blue-400 hover:!bg-white hover:text-blue-600 focus:text-blue-600 focus:bg-white focus:!ring-0 active:scale-95"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              disabled={
                stockMethods?.formState?.isSubmitting ||
                !stockMethods?.formState?.isDirty
              }
              className="focus:!ring-0 active:scale-95 "
              onClick={stockMethods?.handleSubmit(async (newData) => {
                try {
                  const quantity = parseInt(newData?.quantity);
                  if (isNaN(quantity) || quantity < 0) {
                    alert("Please enter a valid quantity");
                    return;
                  }

                  const result = await upsertBranchStocks({
                    stockId: newData?.id as string,
                    branchId: branch_info?.id,
                    quantity: quantity,
                    stockName: newData?.name,
                    staff_id: userId!,
                  });

                  if (!result.success) throw new Error(result.message);

                  handleModalClose();
                } catch (_error) {
                  console.error(_error);
                }
              })}
            >
              {!watchStockId
                ? stockMethods?.formState?.isSubmitting
                  ? "Adding"
                  : "Add"
                : stockMethods?.formState?.isSubmitting
                ? "Updating"
                : "Update"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
