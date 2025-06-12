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
          <Building2 className="w-5 h-5 text-blue-600" />
          {isUpdate ? "Update Branch" : "Add Branch"}
        </div>
      }
      isSubmitting={isSubmitting}
      onClose={handleModalClose}
    >
      <Controller control={control} name="id" render={() => <Input hidden />} />
      <div className="grid grid-cols-1 mb-4">
        <div className="col-span-1">
          <Controller
            control={control}
            name="name"
            render={({ field, formState: { errors } }) => (
              <div className="relative">
                <Input
                  disabled={isSubmitting}
                  label="Branch Name"
                  placeholder="Enter branch name"
                  error={!!errors.name}
                  {...field}
                  className="pl-10"
                />
                <Building2 className="absolute left-3 top-[2.2rem] w-4 h-4 text-gray-400" />
              </div>
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
              <div className="relative">
                <Input
                  disabled={isSubmitting}
                  label="Description"
                  placeholder="Enter branch description"
                  error={!!errors.description}
                  {...field}
                  className="pl-10"
                />
                <FileText className="absolute left-3 top-[2.2rem] w-4 h-4 text-gray-400" />
              </div>
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
              <div className="relative">
                <Input
                  disabled={isSubmitting}
                  label="Address"
                  placeholder="Enter full address"
                  error={!!errors.address}
                  {...field}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-[2.2rem] w-4 h-4 text-gray-400" />
              </div>
            )}
          />
        </div>
      </div>
      <div className="mt-8">
        <div className="flex justify-end items-center gap-x-2">
          <Button
            disabled={isSubmitting}
            className="bg-transparent text-blue-400 border focus:text-white focus border-blue-400 hover:bg-blue-400 hover:text-white inline-flex items-center gap-2"
            onClick={handleModalClose}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center gap-2"
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

                if (error) throw error;

                handleModalClose();
              } catch (_error) {
                console.error(_error);
              }
            })}
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
