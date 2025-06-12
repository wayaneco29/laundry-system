"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Plus, 
  Eye, 
  MapPin, 
  FileText, 
  Hash 
} from "lucide-react";

import { UpsertBranchModal } from "./upsert-branch-modal";
import { BranchTable } from "./branch-table";
import { customerRevalidateTag } from "@/app/actions";

type BranchesPageProps = {
  branch_list: Array<Record<string, string>>;
};

export function MainBranchesPage({ branch_list }: BranchesPageProps) {
  const router = useRouter();

  const [showModal, setShowModal] = useState<boolean>(false);

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
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-100 text-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          <Plus className="size-4" /> Add Branch
        </button>
      </div>
      <div className="mt-4">
        <div className="flex flex-col">
          <BranchTable 
            data={branch_list} 
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
