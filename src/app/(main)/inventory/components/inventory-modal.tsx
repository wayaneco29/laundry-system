"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Package, Save, Trash2 } from "lucide-react";
import { Modal, Button, Select, Input } from "@/app/components/common";
import { upsertBranchStocks } from "@/app/actions";

type InventoryFormData = {
  id: string | null;
  isUpdate: boolean;
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
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<InventoryFormData>({
    defaultValues: initialValue,
    mode: "onChange",
  });

  // Reset form when initialValue changes (for edit mode)
  React.useEffect(() => {
    reset(initialValue);
  }, [initialValue, reset]);

  const onSubmit = async (data: InventoryFormData) => {
    console.log("Form data submitted:", data);
    try {
      const quantity = parseInt(data.quantity);
      if (isNaN(quantity) || quantity < 0) {
        alert("Please enter a valid quantity");
        return;
      }

      // Find the selected branch
      const selectedBranch = branches.find((b) => b.id === data.branchId);
      if (!selectedBranch) {
        alert("Selected branch not found");
        return;
      }

      // Get current branch stocks
      let currentStocks = [];
      if (selectedBranch.branch_stocks) {
        currentStocks =
          typeof selectedBranch.branch_stocks === "string"
            ? JSON.parse(selectedBranch.branch_stocks)
            : selectedBranch.branch_stocks;
      }

      // Ensure currentStocks is an array
      if (!Array.isArray(currentStocks)) {
        currentStocks = [];
      }

      const newItem = {
        id: data.id || crypto.randomUUID(),
        name: data.name.trim(),
        quantity: quantity,
      };

      let updatedStocks;
      if (data.isUpdate && data.id) {
        // Update existing item
        updatedStocks = currentStocks.map((stock) =>
          stock.id === data.id ? newItem : stock
        );
      } else {
        // Add new item
        updatedStocks = [...currentStocks, newItem];
      }

      // Update branch stocks
      const result = await upsertBranchStocks({
        branchId: data.branchId,
        stocks: updatedStocks,
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

  const handleDelete = async () => {
    if (!initialValue.isUpdate || !initialValue.id || !initialValue.branchId) {
      return;
    }

    if (!confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }

    try {
      // Find the selected branch
      const selectedBranch = branches.find(
        (b) => b.id === initialValue.branchId
      );
      if (!selectedBranch) {
        alert("Selected branch not found");
        return;
      }

      // Get current branch stocks
      let currentStocks = [];
      if (selectedBranch.branch_stocks) {
        currentStocks =
          typeof selectedBranch.branch_stocks === "string"
            ? JSON.parse(selectedBranch.branch_stocks)
            : selectedBranch.branch_stocks;
      }

      // Ensure currentStocks is an array
      if (!Array.isArray(currentStocks)) {
        currentStocks = [];
      }

      // Remove the item
      const updatedStocks = currentStocks.filter(
        (stock) => stock.id !== initialValue.id
      );

      // Update branch stocks
      const result = await upsertBranchStocks({
        branchId: initialValue.branchId,
        stocks: updatedStocks,
      });

      if (result.success) {
        onClose();
        window.location.reload(); // Refresh to show updated data
      } else {
        alert(result.message || "Failed to delete inventory item");
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      alert("An error occurred while deleting the inventory item");
    }
  };

  return (
    <Modal
      title={
        initialValue.isUpdate ? "Update Inventory Item" : "Add Inventory Item"
      }
      show={showModal}
      onClose={onClose}
      isSubmitting={isSubmitting}
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

        <Controller
          name="branchId"
          control={control}
          rules={{ required: "Branch is required" }}
          render={({ field }) => (
            <div>
              <Select
                {...field}
                label="Branch"
                placeholder="Select a branch"
                isDisabled={initialValue.isUpdate} // Disable branch selection when editing
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

        <div className="flex justify-between pt-4">
          {/* Delete button (only show in edit mode) */}
          <div>
            {initialValue.isUpdate && initialValue.id && (
              <Button
                type="button"
                onClick={handleDelete}
                variant="danger"
                disabled={isSubmitting}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </Button>
            )}
          </div>

          {/* Cancel and Save buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSubmitting
                ? "Saving..."
                : initialValue.isUpdate
                ? "Update"
                : "Add"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
