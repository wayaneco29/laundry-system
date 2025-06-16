"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { UpsertBranchModal } from "./upsert-branch-modal";
import { BranchTable } from "./branch-table";
import { customerRevalidateTag } from "@/app/actions";
import { Button } from "@/app/components/common";

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
        <Button
          variant="outline"
          leftIcon={<Plus />}
          onClick={() => setShowModal(true)}
        >
          Add Branch
        </Button>
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
