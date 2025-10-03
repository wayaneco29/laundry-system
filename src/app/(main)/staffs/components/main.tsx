"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";

import { AddStaffModal } from "./add-staff-modal";
import { StaffTable } from "./staff-table";
import { Button } from "@/app/components/common";

type MainStaffPageProps = {
  initialData: Array<Record<string, string>>;
};

export function MainStaffPage({ initialData }: MainStaffPageProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [initialValues, setInitialValues] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    email: "",
    address: "",
    employment_date: "",
    created_by: "",
    username: "",
    password: "",
    branch_id: "",
    role_id: "",
  });

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
            Staff Management
          </h1>
          <p className="text-slate-600">
            Manage your team members and their information
          </p>
        </div>
        <Button
          leftIcon={<Plus className="size-4" />}
          className="inline-flex items-center gap-x-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowModal(true)}
        >
          Add Staff
        </Button>
      </div>

      <div className="relative mt-4 w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by staff name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 h-10 text-sm pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <div className="flex flex-col">
          <StaffTable
            initialData={initialData}
            search={debouncedSearch}
            onEdit={(staff) => {
              setInitialValues({
                first_name: staff?.first_name,
                middle_name: staff?.middle_name,
                last_name: staff?.last_name,
                phone: staff?.phone,
                email: staff?.email,
                address: staff?.address,
                employment_date: staff?.employment_date,
                created_by: staff?.created_by,
                branch_id: staff?.branch_id,
                password: staff?.password,
                role_id: staff?.role_id,
                username: staff?.username,
              });
              setShowModal(true);
            }}
          />
        </div>
      </div>
      <AddStaffModal
        initialValues={initialValues}
        showModal={showModal}
        onClose={() => {
          setInitialValues({
            first_name: "",
            middle_name: "",
            last_name: "",
            phone: "",
            email: "",
            address: "",
            employment_date: "",
            created_by: "",
            username: "",
            password: "",
            branch_id: "",
            role_id: "",
          });
          setShowModal(false);
        }}
      />
    </div>
  );
}
