"use client";

import { useState, useEffect } from "react";
import { Plus, Package, AlertTriangle, Search } from "lucide-react";

import { InventoryTable } from "./inventory-table";
import { InventoryModal } from "./inventory-modal";
import { Button, Select } from "@/app/components/common";
import { getAllBranches } from "@/app/actions";
import { getAllBranchStocks } from "@/app/actions/branch_stocks";
import { useUserContext } from "@/app/context";

type MainInventoryPageProps = {
  initialData: Array<Record<string, any>>;
  count: number;
  branches: Array<Record<string, any>>;
};

export function MainInventoryPage({
  initialData,
  count,
  branches,
}: MainInventoryPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
  const [inventoryList, setInventoryList] = useState<Array<any>>(
    initialData || []
  );
  const [totalCount, setTotalCount] = useState(count || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const { is_admin, branch_id } = useUserContext();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearch, selectedBranch, initialData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const inventoryResult = await getAllBranchStocks({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        branchId: selectedBranch || branch_id || undefined,
      });

      if (inventoryResult.data) {
        setInventoryList(inventoryResult.data);
        setTotalCount(inventoryResult.count || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const lowStockItems = inventoryList.filter(
    (item) => item.quantity > 0 && item.quantity <= 10
  );
  const outOfStockItems = inventoryList.filter((item) => item.quantity === 0);

  const branchOptions = [
    { label: "All Branches", value: "" },
    ...(branches?.map(({ id, name }) => ({ label: name, value: id })) || []),
  ];

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
        <Button
          leftIcon={<Plus className="size-4" />}
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            setIsEditing(false);
            setShowModal(true);
          }}
        >
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {lowStockItems.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {outOfStockItems.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-end gap-4 mb-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 py-2 border bg-white border-gray-300 text-sm rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
          />
        </div>
        {is_admin && (
          <Select
            containerClassName="w-full md:w-64"
            value={selectedBranch}
            onChange={(newValue) =>
              setSelectedBranch((newValue as { value: string })?.value)
            }
            options={branchOptions}
          />
        )}
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <InventoryTable
            data={inventoryList}
            totalCount={totalCount}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            isLoading={loading}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onEdit={(item) => {
              setIsEditing(true);
              setInitialValue({
                isUpdate: true,
                id: item?.id,
                name: item?.stock_name,
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
          setIsEditing(false);
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
