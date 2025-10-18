"use client";

import { useEffect, useState } from "react";

import { getAllCustomers } from "@/app/actions";
import { Modal, Select } from "@/app/components/common";

type OrderModalProps = {
  showModal: boolean;
  onClose: () => void;
};

export const OrderModal = ({ showModal, onClose }: OrderModalProps) => {
  const [customerList, setCustomerList] = useState<
    Array<{
      full_name: string;
      customer_id: string;
    }>
  >([]);

  useEffect(() => {
    getAllCustomers().then(
      (res: {
        data: Array<{
          full_name: string;
          customer_id: string;
        }>;
      }) => {
        setCustomerList(res!.data);
      }
    );
  }, []);

  return (
    <Modal
      show={showModal}
      title="Add Order"
      isSubmitting={false}
      onClose={() => {
        onClose();
      }}
      size="lg"
    >
      <div className="grid grid-cols-1 mb-4">
        <div className="col-span-1">
          <Select
            label="Customer"
            isSearchable={false}
            placeholder="Select customer"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getOptionLabel={(option: any) => option?.full_name}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getOptionValue={(option: any) => option?.customer_id}
            options={customerList}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 mb-4">
        <div className="col-span-1">
          <Select
            label="Services"
            isSearchable={false}
            placeholder="Select services"
            isMulti
          />
        </div>
      </div>
      <div className="grid grid-cols-1">
        <div className="col-span-1">
          <div className="flex justify-end items-center gap-x-4 mb-4">
            <div className="font-medium">Total:</div>
            <div className="text-xl font-bold">PHP 500</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
