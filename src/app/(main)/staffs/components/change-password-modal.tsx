"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { KeyIcon, Save, X } from "lucide-react";

import { updateStaffPassword } from "@/app/actions/staff/update_staff_password";
import { Modal, Button, Input } from "@/app/components/common";
import { useForm, Controller } from "react-hook-form";

type ChangePasswordModalProps = {
  staffId: string;
  staffName: string;
  showModal: boolean;
  onClose: () => void;
};

const validationSchema = Yup.object().shape({
  new_password: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirm_password: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("new_password")], "Passwords must match"),
});

export const ChangePasswordModal = ({
  staffId,
  staffName,
  showModal,
  onClose,
}: ChangePasswordModalProps) => {
  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
    resolver: yupResolver(validationSchema),
  });

  const handleModalClose = () => {
    reset({
      new_password: "",
      confirm_password: "",
    });
    onClose();
  };

  return (
    <Modal
      show={showModal}
      title={
        <div className="flex items-center gap-2">
          <KeyIcon className="w-5 h-5" />
          Change Password
        </div>
      }
      isSubmitting={isSubmitting}
      onClose={handleModalClose}
      size="md"
      footer={
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
            onClick={handleSubmit(async (data) => {
              try {
                const { error } = await updateStaffPassword({
                  user_id: staffId,
                  new_password: data.new_password,
                });

                if (error) throw error;

                handleModalClose();
              } catch (_error) {
                console.error(_error);
              }
            })}
          >
            Update Password
          </Button>
        </div>
      }
    >
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Changing password for: <span className="font-semibold">{staffName}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Controller
          control={control}
          name="new_password"
          render={({ field, formState: { errors } }) => (
            <div>
              <Input
                type="password"
                disabled={isSubmitting}
                label="New Password"
                placeholder="Enter new password"
                error={!!errors.new_password}
                icon={<KeyIcon />}
                {...field}
              />
              {errors.new_password && (
                <p className="mt-1 text-xs text-red-600">{errors.new_password.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="confirm_password"
          render={({ field, formState: { errors } }) => (
            <div>
              <Input
                type="password"
                disabled={isSubmitting}
                label="Confirm Password"
                placeholder="Confirm new password"
                error={!!errors.confirm_password}
                icon={<KeyIcon />}
                {...field}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>
          )}
        />
      </div>
    </Modal>
  );
};
