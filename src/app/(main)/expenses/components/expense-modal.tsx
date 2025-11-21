"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  Select,
  Datepicker,
} from "@/app/components/common";
import { upsertExpense } from "@/app/actions/expense";
import { getAllBranches } from "@/app/actions/branch";
import { useCurrentUser } from "@/app/hooks/use-current-user";
import { useUserContext } from "@/app/context";

type ExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
  mode: "create" | "edit" | "view";
  onShowToast?: (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => void;
  onSuccess?: () => void;
};

const expenseCategories = [
  { label: "Supplies", value: "Supplies" },
  { label: "Equipment", value: "Equipment" },
  { label: "Utilities", value: "Utilities" },
  { label: "Rent", value: "Rent" },
  { label: "Salaries", value: "Salaries" },
  { label: "Marketing", value: "Marketing" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Transportation", value: "Transportation" },
  { label: "Insurance", value: "Insurance" },
  { label: "Other", value: "Other" },
];

export function ExpenseModal({
  isOpen,
  onClose,
  expense,
  mode,
  onShowToast,
  onSuccess,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "Supplies",
    expense_date: new Date().toISOString().split("T")[0],
    branch_id: "",
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { userId } = useCurrentUser();
  const { is_admin, branch_id } = useUserContext();
  useEffect(() => {
    if (isOpen) {
      fetchBranches();

      if (expense && (mode === "edit" || mode === "view")) {
        setFormData({
          title: expense.title || "",
          description: expense.description || "",
          amount: expense.amount?.toString() || "",
          category: expense.category || "Supplies",
          expense_date:
            expense.expense_date || new Date().toISOString().split("T")[0],
          branch_id: is_admin ? expense.branch_id || "" : branch_id,
        });
      } else {
        // Reset form for create mode
        setFormData({
          title: "",
          description: "",
          amount: "",
          category: "Supplies",
          expense_date: new Date().toISOString().split("T")[0],
          branch_id: is_admin ? "" : branch_id,
        });
      }
      setErrors({});
    }
  }, [isOpen, expense, mode]);

  const fetchBranches = async () => {
    try {
      const result = await getAllBranches();
      if (result.data) {
        setBranches(result.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (
      !formData.amount ||
      isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.expense_date) {
      newErrors.expense_date = "Expense date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "view") return;

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Check if "All Branches" is selected (empty string or no branch_id)
      const isAllBranches = !formData.branch_id || formData.branch_id === "";

      if (isAllBranches && mode === "create") {
        // Create expense for each branch
        const promises = branches.map((branch) =>
          upsertExpense({
            p_expense_id: null,
            p_title: formData.title,
            p_description: formData.description || undefined,
            p_amount: Number(formData.amount),
            p_category: formData.category as any,
            p_expense_date: formData.expense_date,
            p_branch_id: is_admin ? branch?.id : branch_id,
            p_created_by: userId!,
          })
        );

        const results = await Promise.all(promises);

        // Check if any failed
        const failed = results.filter((result) => result.error);
        if (failed.length > 0) {
          console.error("Error saving some expenses:", failed);
          onShowToast?.(
            `Created ${results.length - failed.length} expenses, ${
              failed.length
            } failed`,
            "warning"
          );
        } else {
          onShowToast?.(
            `Created expense for all ${branches.length} branches successfully`,
            "success"
          );
        }
        onSuccess?.();
        onClose();
      } else {
        // Single expense (either edit mode or specific branch selected)
        const result = await upsertExpense({
          p_expense_id: expense?.id || null,
          p_title: formData.title,
          p_description: formData.description || undefined,
          p_amount: Number(formData.amount),
          p_category: formData.category as any,
          p_expense_date: formData.expense_date,
          p_branch_id: formData.branch_id || undefined,
          p_created_by: userId!,
        });

        if (result.error) {
          console.error("Error saving expense:", result.error);
          onShowToast?.("Error saving expense. Please try again.", "error");
        } else {
          onShowToast?.(
            `Expense ${mode === "create" ? "created" : "updated"} successfully`,
            "success"
          );
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      onShowToast?.("Error saving expense. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    // Extract value if it's an object from Select component
    const actualValue =
      typeof value === "object" && value?.value !== undefined
        ? value.value
        : value;

    setFormData((prev) => ({ ...prev, [field]: actualValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const branchOptions = [
    { label: "All Branches", value: "" },
    ...branches.map((branch) => ({
      label: branch.name,
      value: branch.id,
    })),
  ];

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Add New Expense";
      case "edit":
        return "Edit Expense";
      case "view":
        return "View Expense";
      default:
        return "Expense";
    }
  };

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      footer={
        mode !== "view" ? (
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading
                ? "Saving..."
                : mode === "create"
                ? "Create Expense"
                : "Update Expense"}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <Input
              label="Title *"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              error={!!errors.title}
              disabled={mode === "view"}
              placeholder="Enter expense title"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={mode === "view"}
              placeholder="Enter expense description"
            />
          </div>

          <div>
            <Input
              label="Amount *"
              inputMode="numeric"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              error={!!errors.amount}
              disabled={mode === "view"}
              placeholder="0.00"
            />
          </div>

          <div>
            <Select
              label="Category *"
              isSearchable={false}
              options={expenseCategories}
              value={formData.category}
              onChange={(value) => handleInputChange("category", value)}
              error={!!errors.category}
              disabled={mode === "view"}
            />
          </div>

          <div className={is_admin ? "col-span-1" : "col-span-2"}>
            <Datepicker
              disabled={mode === "view"}
              dropdownPlacement="top"
              label="Expense Date *"
              value={
                formData.expense_date
                  ? new Date(formData.expense_date)
                  : new Date()
              }
              onChange={(date) => handleInputChange("expense_date", date)}
              error={!!errors.expense_date}
              placeholder="Select expense date"
            />
            {errors.expense_date && (
              <p className="mt-1 text-sm text-red-600">{errors.expense_date}</p>
            )}
          </div>

          {is_admin && (
            <div>
              <Select
                label="Branch"
                isSearchable={false}
                options={branchOptions}
                value={formData.branch_id}
                onChange={(value) => handleInputChange("branch_id", value)}
                disabled={mode === "view"}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
