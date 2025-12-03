"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { KeyIcon, Save, X } from "lucide-react";
import { useState } from "react";

import { updateOwnPassword } from "@/app/actions/auth/update_own_password";
import { Modal, Button, Input } from "@/app/components/common";
import { useForm, Controller } from "react-hook-form";

type ChangeOwnPasswordModalProps = {
  showModal: boolean;
  onClose: () => void;
};

const validationSchema = Yup.object().shape({
  current_password: Yup.string().required("Current password is required"),
  new_password: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirm_password: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("new_password")], "Passwords must match"),
});

export const ChangeOwnPasswordModal = ({
  showModal,
  onClose,
}: ChangeOwnPasswordModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    resolver: yupResolver(validationSchema),
  });

  const handleModalClose = () => {
    reset({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setError(null);
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
                setError(null);
                const { error } = await updateOwnPassword({
                  current_password: data.current_password,
                  new_password: data.new_password,
                });

                if (error) {
                  setError(typeof error === "string" ? error : "Failed to update password");
                  return;
                }

                handleModalClose();
              } catch (_error) {
                setError("An unexpected error occurred");
              }
            })}
          >
            Update Password
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        <Controller
          control={control}
          name="current_password"
          render={({ field, formState: { errors } }) => (
            <div>
              <Input
                type="password"
                disabled={isSubmitting}
                label="Current Password"
                placeholder="Enter current password"
                error={!!errors.current_password}
                icon={<KeyIcon />}
                {...field}
              />
              {errors.current_password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.current_password.message}
                </p>
              )}
            </div>
          )}
        />
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
                <p className="mt-1 text-xs text-red-600">
                  {errors.new_password.message}
                </p>
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
                label="Confirm New Password"
                placeholder="Confirm new password"
                error={!!errors.confirm_password}
                icon={<KeyIcon />}
                {...field}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </Modal>
  );
};
