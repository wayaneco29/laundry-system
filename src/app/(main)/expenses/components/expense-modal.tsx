"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Input, Select, Datepicker } from "@/app/components/common";
import { upsertExpense } from "@/app/actions/expense";
import { getAllBranches } from "@/app/actions/branch";
import { useCurrentUser } from "@/app/hooks/use-current-user";

type ExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
  mode: 'create' | 'edit' | 'view';
  onShowToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
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


export function ExpenseModal({ isOpen, onClose, expense, mode, onShowToast }: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Supplies',
    expense_date: new Date().toISOString().split('T')[0],
    branch_id: '',
  });

  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { userId } = useCurrentUser();

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
      
      if (expense && (mode === 'edit' || mode === 'view')) {
        setFormData({
          title: expense.title || '',
          description: expense.description || '',
          amount: expense.amount?.toString() || '',
          category: expense.category || 'Supplies',
          expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
          branch_id: expense.branch_id || '',
        });
      } else {
        // Reset form for create mode
        setFormData({
          title: '',
          description: '',
          amount: '',
          category: 'Supplies',
          expense_date: new Date().toISOString().split('T')[0],
          branch_id: '',
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
      console.error('Error fetching branches:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.expense_date) {
      newErrors.expense_date = 'Expense date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') return;
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const result = await upsertExpense({
        p_expense_id: expense?.id || null,
        p_title: formData.title,
        p_description: formData.description || undefined,
        p_amount: Number(formData.amount),
        p_category: formData.category as any,
        p_expense_date: formData.expense_date,
        p_branch_id: formData.branch_id || undefined,
        p_created_by: userId
      });

      if (result.error) {
        console.error('Error saving expense:', result.error);
        onShowToast?.('Error saving expense. Please try again.', 'error');
      } else {
        onShowToast?.(`Expense ${mode === 'create' ? 'created' : 'updated'} successfully`, 'success');
        onClose();
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      onShowToast?.('Error saving expense. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    // Extract value if it's an object from Select component
    const actualValue = typeof value === 'object' && value?.value !== undefined ? value.value : value;
    
    setFormData(prev => ({ ...prev, [field]: actualValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const branchOptions = [
    { label: "All Branches", value: "" },
    ...branches.map(branch => ({
      label: branch.name,
      value: branch.id,
    })),
  ];

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Add New Expense';
      case 'edit': return 'Edit Expense';
      case 'view': return 'View Expense';
      default: return 'Expense';
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} title={getModalTitle()}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <Input
              label="Title *"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={errors.title}
              disabled={mode === 'view'}
              placeholder="Enter expense title"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={mode === 'view'}
              placeholder="Enter expense description"
              rows={3}
            />
          </div>

          <div>
            <Input
              label="Amount *"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              error={errors.amount}
              disabled={mode === 'view'}
              placeholder="0.00"
            />
          </div>

          <div>
            <Select
              label="Category *"
              options={expenseCategories}
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
              error={errors.category}
              disabled={mode === 'view'}
            />
          </div>

          <div>
            <Datepicker
              label="Expense Date *"
              value={formData.expense_date ? new Date(formData.expense_date) : new Date()}
              onChange={(date) => handleInputChange('expense_date', date)}
              error={!!errors.expense_date}
              placeholder="Select expense date"
            />
            {errors.expense_date && (
              <p className="mt-1 text-sm text-red-600">{errors.expense_date}</p>
            )}
          </div>

          <div>
            <Select
              label="Branch"
              options={branchOptions}
              value={formData.branch_id}
              onChange={(value) => handleInputChange('branch_id', value)}
              disabled={mode === 'view'}
            />
          </div>

        </div>

        {mode !== 'view' && (
          <div className="flex justify-end space-x-3 pt-6 border-t">
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
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Expense' : 'Update Expense'}
            </Button>
          </div>
        )}

        {mode === 'view' && (
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}