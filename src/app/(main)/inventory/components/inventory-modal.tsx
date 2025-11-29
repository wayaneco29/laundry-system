"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Package, Save, Trash2 } from "lucide-react";
import { Modal, Button, Select, Input } from "@/app/components/common";
import { addNewStock } from "@/app/actions";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { useUserContext } from "@/app/context";
import { useStaffShift } from "@/app/hooks/use-staff-shift";

type InventoryFormData = {
  id: string | null;
  name: string;
  quantity: string;
  branchId: string;
};

type InventoryModalProps = {
  showModal: boolean;
  initialValue: InventoryFormData;
  branches: Array<Record<string, unknown>>;
  onClose: () => void;
  onDelete?: (itemId: string, branchId: string) => void;
};

export function InventoryModal({
  showModal,
  initialValue,
  branches,
  onClose,
}: InventoryModalProps) {
  const { userId } = useCurrentUser();
  const { is_admin } = useUserContext();
  const { currentBranchId } = useStaffShift();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<InventoryFormData>({
    defaultValues: initialValue,
    mode: "onChange",
  });

  console.log(initialValue);
  // Reset form when initialValue changes (for edit mode)
  React.useEffect(() => {
    reset(initialValue);
  }, [initialValue, reset]);

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const quantity = parseInt(data.quantity);
      if (isNaN(quantity) || quantity < 0) {
        alert("Please enter a valid quantity");
        return;
      }

      const result = await addNewStock({
        branchId: is_admin ? data?.branchId : (currentBranchId || ""),
        stockName: data.name.trim(),
        quantity: quantity,
        staff_id: userId!,
      });

      if (result.success) {
        onClose();
        window.location.reload(); // Refresh to show updated data
      } else {
        alert(result.message || "Failed to save inventory item");
      }
    } catch (error) {
      console.error("Error saving inventory item:", error);
      alert("An error occurred while saving the inventory item");
    }
  };

  return (
    <Modal
      closeOnBackdrop={false}
      title={initialValue.id ? "Update Inventory Item" : "Add Inventory Item"}
      show={showModal}
      onClose={onClose}
      isSubmitting={isSubmitting}
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Saving..." : initialValue.id ? "Update" : "Add"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="name"
          control={control}
          rules={{
            required: "Item name is required",
            minLength: {
              value: 2,
              message: "Item name must be at least 2 characters",
            },
          }}
          render={({ field }) => (
            <div>
              <Input
                {...field}
                type="text"
                label="Item Name"
                placeholder="Enter item name"
                required
                icon={<Package className="h-4 w-4" />}
                error={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}
        />

        {is_admin && (
          <Controller
            name="branchId"
            control={control}
            rules={{ required: "Branch is required" }}
            render={({ field }) => (
              <div>
                <Select
                  {...field}
                  label="Branch"
                  isSearchable={false}
                  placeholder="Select a branch"
                  isDisabled={!!initialValue.id} // Disable branch selection when editing
                  options={branches.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                  }))}
                  onChange={(newValue) => {
                    field.onChange((newValue as { value: string })?.value!);
                  }}
                />
                {errors.branchId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.branchId.message}
                  </p>
                )}
              </div>
            )}
          />
        )}
        <Controller
          name="quantity"
          control={control}
          rules={{
            required: "Quantity is required",
            min: { value: 0, message: "Quantity must be 0 or greater" },
            pattern: {
              value: /^\d+$/,
              message: "Quantity must be a valid number",
            },
          }}
          render={({ field }) => (
            <div>
              <Input
                {...field}
                type="number"
                label="Quantity"
                placeholder="Enter quantity"
                required
                min="0"
                error={!!errors.quantity}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          )}
        />
      </form>
    </Modal>
  );
}
