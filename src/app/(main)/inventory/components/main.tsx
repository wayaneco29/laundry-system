"use client";

import { useState } from "react";
import { Plus, Package, AlertTriangle } from "lucide-react";

import { InventoryTable } from "./inventory-table";
import { InventoryModal } from "./inventory-modal";

type MainInventoryPageProps = {
  branches: Array<Record<string, any>>;
};

export function MainInventoryPage({ branches }: MainInventoryPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [initialValue, setInitialValue] = useState<{
    id: string | null;
    isUpdate: boolean;
    name: string;
    quantity: string;
    branchId: string;
  }>({
    id: null,
    isUpdate: false,
    name: "",
    quantity: "",
    branchId: "",
  });

  // Get all inventory items from all branches
  const getAllInventoryItems = () => {
    const items: any[] = [];
    branches.forEach((branch) => {
      if (branch.branch_stocks) {
        const stocks = typeof branch.branch_stocks === 'string' 
          ? JSON.parse(branch.branch_stocks) 
          : branch.branch_stocks;
        
        if (Array.isArray(stocks)) {
          stocks.forEach((stock) => {
            items.push({
              ...stock,
              branch_id: branch.id,
              branch_name: branch.name,
            });
          });
        }
      }
    });
    return items;
  };

  const inventoryItems = getAllInventoryItems();
  const lowStockItems = inventoryItems.filter(item => item.quantity <= 10);
  const outOfStockItems = inventoryItems.filter(item => item.quantity === 0);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Inventory Management
          </h1>
          <p className="text-slate-600">
            Manage your laundry supplies and stock levels
          </p>
        </div>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-100 text-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          <Plus className="size-4" /> Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Filter */}
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="branch-filter" className="text-sm font-medium text-gray-700">
          Filter by Branch:
        </label>
        <select
          id="branch-filter"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <InventoryTable
            data={inventoryItems}
            selectedBranch={selectedBranch}
            onEdit={(item) => {
              setInitialValue({
                isUpdate: true,
                id: item?.id,
                name: item?.name,
                quantity: item?.quantity?.toString() || "0",
                branchId: item?.branch_id,
              });
              setShowModal(true);
            }}
          />
        </div>
      </div>
      
      <InventoryModal
        initialValue={initialValue}
        showModal={showModal}
        branches={branches}
        onClose={() => {
          setInitialValue({
            id: null,
            isUpdate: false,
            name: "",
            quantity: "",
            branchId: "",
          });
          setShowModal(false);
        }}
      />
    </div>
  );
}