"use client";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { Modal, Button, Select, Input } from "@/app/components/common";
import { SERVICE_STATUS_DROPDOWN } from "@/app/constants";
import { BranchProvider } from "@/app/providers";
import { upsertService } from "@/app/actions";

type ServiceModalProps = {
  showModal: boolean;
  onClose: () => void;
  initialValue: {
    id: string | null;
    isUpdate: boolean;
    name: string;
    branchId: string;
    price: string;
    status: string;
  };
};

export const ServiceModal = ({
  showModal,
  onClose,
  initialValue,
}: ServiceModalProps) => {
  const {
    reset,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm({
    values: initialValue,
    resolver: yupResolver(
      Yup.object().shape({
        id: Yup.string().nullable(),
        isUpdate: Yup.boolean(),
        name: Yup.string().required(),
        price: Yup.string().required(),
        branchId: Yup.string().required(),
        status: Yup.string().required(),
      })
    ),
  });

  const isUpdate = watch("isUpdate", false);

  const handleModalClose = () => {
    reset({
      id: null,
      isUpdate: false,
      name: "",
      price: "",
      branchId: "",
      status: "Active",
    });

    onClose();
  };

  return (
    <Modal
      show={showModal}
      title="Add Promo"
      isSubmitting={isSubmitting}
      onClose={handleModalClose}
    >
      <Controller control={control} name="id" render={() => <Input hidden />} />
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
            name="price"
            render={({ field, formState: { errors } }) => (
              <Input
                disabled={isSubmitting}
                label="Price"
                placeholder="Price"
                error={!!errors.price}
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
            name="branchId"
            render={({
              field: { value = [], onChange, ...field },
              formState: { errors },
            }) => (
              <BranchProvider
                disabled={isSubmitting}
                label="Branch"
                placeholder="Branch"
                error={!!errors?.branchId}
                {...field}
                onChange={(newValue: any) => {
                  onChange(newValue?.value);
                }}
              />
            )}
          />
        </div>
        <div className="col-span-1">
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, ...field } }) => (
              <Select
                label="Status"
                placeholder="Status"
                isDisabled={!isUpdate}
                options={SERVICE_STATUS_DROPDOWN}
                {...field}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={({ value }: any) => {
                  onChange(value);
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
                const { error } = await upsertService({
                  p_service_id: newData.id as string,
                  p_branch_id: newData.branchId,
                  p_name: newData.name,
                  p_price: newData.price,
                  p_status: newData.status,
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
  );
};
