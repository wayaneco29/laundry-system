"use client";

import { useState, useEffect } from "react";
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

  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    fetchCustomers(currentPage, itemsPerPage, debouncedSearch);
  }, [currentPage, itemsPerPage, debouncedSearch, initialData]);

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
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Customer Management
          </h1>
          <p className="text-slate-600">
            Manage your customers and their information
          </p>
        </div>
        <Button
          leftIcon={<Plus className="size-4" />}
          className="inline-flex items-start gap-x-2 mt-4 sm:mt-0 self-end sm:self-start w-full sm:w-auto active:scale-95 focus:!ring-0 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowModal(true)}
        >
          Add Customer
        </Button>
      </div>

      <div className="relative mt-4 w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 h-10 text-sm pr-4 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
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
        </div>
      </div>
      <UpsertCustomerModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
