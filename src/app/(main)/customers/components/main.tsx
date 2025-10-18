"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { customerRevalidateTag, getAllCustomers } from "@/app/actions";
import { UpsertCustomerModal } from "./upsert-customer-modal";
import { CustomersTable } from "./customers-table";
import { Button } from "@/app/components/common";

type MainCustomerPageProps = {
  initialData: Array<Record<string, string>>;
  count: number;
};

export function MainCustomerPage({
  initialData,
  count,
}: MainCustomerPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [customerList, setCustomerList] = useState<
    Array<Record<string, string>>
  >(initialData || []);
  const [totalCount, setTotalCount] = useState<number>(count || 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const isInitialMount = useRef(true);

  const router = useRouter();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch customers when pagination/search changes (skip initial mount)
  useEffect(() => {
    // Skip the first render to avoid fetching data twice
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    fetchCustomers(currentPage, itemsPerPage, debouncedSearch);
  }, [currentPage, itemsPerPage, debouncedSearch]);

  const fetchCustomers = async (
    page: number,
    limit: number,
    search?: string
  ) => {
    setIsLoading(true);
    try {
      const { data, count } = await getAllCustomers({ page, limit, search });
      setCustomerList(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="text-center sm:text-start">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Customer Management
          </h1>
          <p className="text-slate-600">
            Manage your customers and their information
          </p>
        </div>
        <Button
          leftIcon={<Plus className="size-4" />}
          className="w-full sm:w-auto sm:self-start"
          onClick={() => setShowModal(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 h-12 text-base pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Customers Table */}
      <CustomersTable
        data={customerList}
        totalCount={totalCount}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onView={(customer) => {
          customerRevalidateTag("getCustomer");
          router.push(`/customers/${customer?.customer_id}`);
        }}
      />

      <UpsertCustomerModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
