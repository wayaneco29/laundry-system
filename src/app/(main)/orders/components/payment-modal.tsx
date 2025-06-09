"use client";

import { Button, Modal } from "@/app/components/common";

type PaymentModalProps = {
  show: boolean;
  grossTotal: string;
  onClose: () => void;
  onSubmit: () => void;
};

export const PaymentModal = ({ show, onClose }: PaymentModalProps) => {
  return (
    <Modal show={show} onClose={onClose} title="Payment" isSubmitting>
      <div className="flex flex-wrap gap-4">
        <div>
          <label>Customer Name</label>
          <div className="ml-4 font-mediums">Ace Sebastian</div>
        </div>
      </div>
      <div className="flex justify-end gap-x-4 mt-5 pt-5">
        <Button
          className="bg-transparent text-red-500 border-red-400 hover:bg-gray-100 focus:bg-gray-100"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button>Pay</Button>
      </div>
    </Modal>
  );
};
