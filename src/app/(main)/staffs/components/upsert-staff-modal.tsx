"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Save,
  X,
  UserCircle2,
} from "lucide-react";

import { upsertStaff } from "@/app/actions";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { Modal, Button, Input, Datepicker } from "@/app/components/common";
import { useForm, Controller } from "react-hook-form";

type UpsertStaffModalProps = {
  initialValues: {
    isUpdate: boolean;
    staff_id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    phone: string;
    email: string;
    address: string;
    employment_date: string;
    created_by: string;
  };
  showModal: boolean;
  onClose: () => void;
};

export const UpsertStaffModal = ({
  initialValues,
  showModal,
  onClose,
}: UpsertStaffModalProps) => {
  const { userId } = useCurrentUser();
  const {
    reset,
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm({
    values: initialValues,
    resolver: yupResolver(
      Yup.object().shape({
        isUpdate: Yup.boolean(),
        staff_id: Yup.string().nullable(),
        first_name: Yup.string().required("First Name is required"),
        middle_name: Yup.string(),
        last_name: Yup.string().required("Last Name is required"),
        phone: Yup.string().required("Phone Number is required"),
        email: Yup.string().email("Email is invalid").notRequired(),
        address: Yup.string().required("Address is required"),
        employment_date: Yup.string().required("Employment Date is required"),
        created_by: Yup.string(),
      })
    ),
  });

  const isUpdate = watch("isUpdate");

  const handleModalClose = () => {
    reset({
      isUpdate: false,
      staff_id: null,
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      email: "",
      address: "",
      employment_date: "",
      created_by: "",
    });

    onClose();
  };

  return (
    <Modal
      show={showModal}
      title={
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-5 h-5" />
          {isUpdate ? "Update Staff" : "Add Staff"}
        </div>
      }
      isSubmitting={isSubmitting}
      onClose={handleModalClose}
      size="xl"
    >
      <Controller
        control={control}
        name="staff_id"
        render={() => <Input containerClassName="hidden" />}
      />
      <div className="grid grid-cols-1 gap-x-2 mb-4">
        <div className="col-span-1">
          <Controller
            control={control}
            name="first_name"
            render={({ field, formState: { errors } }) => (
              <Input
                disabled={isSubmitting}
                label="First Name"
                placeholder="Enter first name"
                error={!!errors.first_name}
                icon={<User />}
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
                placeholder="Enter middle name"
                error={!!errors.middle_name}
                icon={<User />}
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
                placeholder="Enter last name"
                error={!!errors?.last_name}
                icon={<User />}
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
                placeholder="Enter phone number"
                error={!!errors.phone}
                icon={<Phone />}
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
                placeholder="Enter email address"
                error={!!errors?.email}
                icon={<Mail />}
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
                placeholder="Enter full address"
                error={!!errors?.address}
                icon={<MapPin />}
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
            name="employment_date"
            render={({ field, formState: { errors } }) => (
              <div className="relative">
                <Datepicker
                  disabled={isSubmitting}
                  label="Date of Employment"
                  placeholder="Select employment date"
                  error={!!errors?.employment_date}
                  {...field}
                  icon={<Calendar />}
                />
              </div>
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
                const { error } = await upsertStaff({
                  p_staff_id: newData?.staff_id || null,
                  p_first_name: newData?.first_name,
                  p_middle_name: newData?.middle_name,
                  p_last_name: newData?.last_name,
                  p_phone: newData?.phone,
                  p_email: newData?.email || "",
                  p_address: newData?.address,
                  p_employment_date: newData?.employment_date,
                  p_created_by: userId!, // Use authenticated user ID
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
