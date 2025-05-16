"use client";

import { useState } from "react";
import moment from "moment";

import { UpsertStaffModal } from "./upsert-staff-modal";

type MainStaffPageProps = {
  staff_list: Array<Record<string, string>>;
};

export function MainStaffPage({ staff_list }: MainStaffPageProps) {
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
        <h1 className="text-gray-700 text-2xl font-medium">Staffs</h1>
        <button
          type="button"
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-blue-400 text-white hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => setShowModal(true)}
        >
          Add Staff
        </button>
      </div>
      <div className="mt-4">
        <div className="relative overflow-auto rounded-sm">
          <div className="absolute left-0 top-0 -z-10 h-full w-full rounded-sm bg-white drop-shadow-md"></div>
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="group/head text-xs uppercase text-gray-700">
              <tr>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Staff Name
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Phone Number
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Email
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Address
                </th>
                <th className="bg-blue-400 px-6 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10 text-nowrap">
                  Date Hired
                </th>
                <th className="right-0 bg-blue-400 py-4 group-first/head:first:rounded-tl-sm group-first/head:last:rounded-tr-sm bg-primary-500 text-white sticky top-0 z-10">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="group/body divide-y divide-gray-100">
              {staff_list?.length ? (
                staff_list?.map((staff, index) => (
                  <tr
                    key={index}
                    className="group/row hover:bg-gray-50 bg-white cursor-pointer border border-gray-200"
                    onClick={() => {
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
                  >
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.full_name}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.phone}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.email}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {staff?.address}
                    </td>
                    <td className="text-nowrap px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg">
                      {moment(staff?.employment_date).format("MMMM DD, YYYY")}
                    </td>
                  </tr>
                ))
              ) : (
                <div className="table-row relative h-15 border border-gray-200">
                  <div className="absolute flex items-center justify-center inset-0">
                    NO DATA
                  </div>
                </div>
              )}
            </tbody>
          </table>
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
