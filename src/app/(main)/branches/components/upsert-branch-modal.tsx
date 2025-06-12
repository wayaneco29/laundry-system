"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Building2, MapPin, FileText, Save, X } from "lucide-react";

import { upsertBranch } from "@/app/actions/branch/upsert_branch";
import { Modal, Button, Input } from "@/app/components/common";

type UpsertBranchModalProps = {
  showModal: boolean;
  onClose: () => void;
};

export const UpsertBranchModal = ({
  showModal,
  onClose,
}: UpsertBranchModalProps) => {
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

  const isUpdate = watch("isUpdate");

  const handleModalClose = () => {
    reset({
      isUpdate: false,
      id: null,
      name: "",
      description: "",
      address: "",
    });

    onClose();
  };
  return (
    <Modal
      show={showModal}
      title={
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          {isUpdate ? "Update Branch" : "Add Branch"}
        </div>
      }
      isSubmitting={isSubmitting}
      onClose={handleModalClose}
      size="lg"
    >
      <Controller
        control={control}
        name="id"
        render={() => <Input containerClassName="hidden" />}
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
                placeholder="Enter branch name"
                error={!!errors.name}
                icon={<Building2 />}
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
                placeholder="Enter branch description"
                error={!!errors.description}
                icon={<FileText />}
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
                placeholder="Enter full address"
                error={!!errors.address}
                icon={<MapPin />}
                {...field}
              />
            )}
          />
        </div>
      </div>
      <div className="mt-8">
        <div className="flex justify-end items-center gap-x-2">
          <Button
            variant="outline"
            disabled={isSubmitting}
            leftIcon={<X />}
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
                const { error } = await upsertBranch({
                  p_branch_id: newData?.id || null,
                  p_name: newData?.name,
                  p_description: newData?.description,
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
  );
};
