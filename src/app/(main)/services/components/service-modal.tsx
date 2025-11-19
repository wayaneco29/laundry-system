"use client";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Package, CheckCircle, Save, X, PhilippinePeso } from "lucide-react";

import { Modal, Button, Select, Input } from "@/app/components/common";
import { SERVICE_STATUS_DROPDOWN } from "@/app/constants";
import { BranchProvider } from "@/app/providers";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { upsertService } from "@/app/actions";
import { useUserContext } from "@/app/context";

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
  const { userId } = useCurrentUser();
  const { is_admin } = useUserContext();
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
      status: "Active",
    });

    onClose();
  };

  return (
    <Modal
      show={showModal}
      title={
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          {isUpdate ? "Update Service" : "Add Service"}
        </div>
      }
      isSubmitting={isSubmitting}
      onClose={handleModalClose}
      size="lg"
      footer={
        <div className="flex justify-end items-center gap-x-2">
          <Button
            disabled={isSubmitting}
            leftIcon={<X />}
            className="bg-transparent text-blue-600 border border-blue-400 hover:!bg-white hover:text-blue-600 focus:text-blue-600 focus:bg-white focus:!ring-0 active:scale-95"
            onClick={handleModalClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={isSubmitting || !isDirty}
            loading={isSubmitting}
            leftIcon={<Save />}
            onClick={handleSubmit(async (newData) => {
              try {
                const { error } = await upsertService({
                  p_service_id: newData?.id as string,
                  p_name: newData?.name,
                  p_price: newData?.price,
                  p_status: newData?.status,
                  p_staff_id: userId!, // Use authenticated user ID
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
      }
    >
      <Controller
        control={control}
        name="id"
        render={() => <Input containerClassName="hidden" />}
      />
      <div className="grid grid-cols-1  gap-y-4 mb-4">
        <div className="col-span-1">
          <Controller
            control={control}
            name="name"
            render={({ field, formState: { errors } }) => (
              <Input
                disabled={isSubmitting}
                label="Service Name"
                placeholder="Enter service name"
                error={!!errors.name}
                icon={<Package />}
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
                placeholder="Enter price"
                error={!!errors.price}
                icon={<PhilippinePeso />}
                {...field}
              />
            )}
          />
        </div>
      </div>
      <div className={`grid grid-cols-1 gap-y-4 mb-4`}>
        {isUpdate && (
          <div className="col-span-1">
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, ...field } }) => (
                <Select
                  icon={<CheckCircle />}
                  label="Status"
                  isSearchable={false}
                  placeholder="Select status"
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
        )}
      </div>
    </Modal>
  );
};
