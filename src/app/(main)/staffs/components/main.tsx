"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { UpsertStaffModal } from "./upsert-staff-modal";
import { StaffTable } from "./staff-table";

type MainStaffPageProps = {
  staff_list: Array<Record<string, string>>;
  totalCount: number;
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  };
};

export function MainStaffPage({
  staff_list,
  totalCount,
  searchParams,
}: MainStaffPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState({
    isUpdate: false,
    staff_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    email: "",
    address: "",
    employment_date: "",
    created_by: "",
  });

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Staff Management
          </h1>
          <p className="text-slate-600">
            Manage your team members and their information
          </p>
        </div>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-100 text-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          <Plus className="size-4" /> Add Staff
        </button>
      </div>
      <div className="mt-4">
        <div className="flex flex-col">
          <StaffTable
            data={staff_list}
            totalCount={totalCount}
            searchParams={searchParams}
            onEdit={(staff) => {
              setInitialValues({
                isUpdate: true,
                staff_id: staff?.staff_id,
                first_name: staff?.first_name,
                middle_name: staff?.middle_name,
                last_name: staff?.last_name,
                phone: staff?.phone,
                email: staff?.email,
                address: staff?.address,
                employment_date: staff?.employment_date,
                created_by: "",
              });
              setShowModal(true);
            }}
          />
        </div>
      </div>
      <UpsertStaffModal
        showModal={showModal}
        onClose={() => {
          setInitialValues({
            isUpdate: false,
            staff_id: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            phone: "",
            email: "",
            address: "",
            employment_date: "",
            created_by: "",
          });
          setShowModal(false);
        }}
        initialValues={initialValues}
      />
    </div>
  );
}
