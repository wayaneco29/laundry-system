"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { UpsertBranchModal } from "./upsert-branch-modal";
import { BranchTable } from "./branch-table";
import { customerRevalidateTag } from "@/app/actions";
import { Button } from "@/app/components/common";

type BranchesPageProps = {
  initialData: Array<Record<string, string>>;
};

export function MainBranchesPage({ initialData }: BranchesPageProps) {
  const router = useRouter();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Branch Management
          </h1>
          <p className="text-slate-600">
            Manage your business locations and their information
          </p>
        </div>
        <Button
          leftIcon={<Plus />}
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Branch
        </Button>
      </div>

      <div className="relative mt-4 w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by branch name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <BranchTable
            initialData={initialData}
            search={debouncedSearch}
            onView={(branch) => {
              customerRevalidateTag("getBranch");
              router?.push(`/branches/${branch?.id}`);
            }}
          />
        </div>
      </div>
      <UpsertBranchModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
