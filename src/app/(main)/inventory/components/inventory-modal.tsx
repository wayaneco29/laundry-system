"use client";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Package, Save, X } from "lucide-react";
import { Modal, Button, Select, Input } from "@/app/components/common";
import { upsertBranchStocks } from "@/app/actions";

type InventoryModalProps = {
  showModal: boolean;
  initialValue: {
    id: string | null;
    isUpdate: boolean;
    name: string;
    quantity: string;
    branchId: string;
  };
  branches: Array<Record<string, any>>;
  onClose: () => void;
};

export function InventoryModal({
  showModal,
  initialValue,
  branches,
  onClose,
}: InventoryModalProps) {
  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    values: initialValue,
    resolver: yupResolver(
      Yup.object().shape({
        id: Yup.string().nullable(),
        isUpdate: Yup.boolean(),
        name: Yup.string().required("Item name is required"),
        quantity: Yup.string().required("Quantity is required"),
        branchId: Yup.string().required("Branch is required"),
      })
    ),
  });

  const onSubmit = async (data: typeof initialValue) => {
    try {
      const quantity = parseInt(data.quantity);
      if (isNaN(quantity) || quantity < 0) {
        alert("Please enter a valid quantity");
        return;
      }

      // Find the selected branch
      const selectedBranch = branches.find(b => b.id === data.branchId);
      if (!selectedBranch) {
        alert("Selected branch not found");
        return;
      }

      // Get current branch stocks
      let currentStocks = [];
      if (selectedBranch.branch_stocks) {
        currentStocks = typeof selectedBranch.branch_stocks === 'string' 
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
        updatedStocks = currentStocks.map(stock => 
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

  return (
    <Modal
      title={initialValue.isUpdate ? "Update Inventory Item" : "Add Inventory Item"}
      showModal={showModal}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="text"
              label="Item Name"
              placeholder="Enter item name"
              required
              icon={Package}
              error={error?.message}
            />
          )}
        />

        <Controller
          name="branchId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              {...field}
              label="Branch"
              placeholder="Select a branch"
              required
              error={error?.message}
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          )}
        />

        <Controller
          name="quantity"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="number"
              label="Quantity"
              placeholder="Enter quantity"
              required
              min="0"
              error={error?.message}
            />
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
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
            icon={Save}
          >
            {isSubmitting ? "Saving..." : initialValue.isUpdate ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}