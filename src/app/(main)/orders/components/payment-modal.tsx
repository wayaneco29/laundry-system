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
    <Modal 
      show={show} 
      onClose={onClose} 
      title="Payment" 
      isSubmitting={false}
      size="md"
    >
      <div className="flex flex-wrap gap-4">
        <div>
          <label>Customer Name</label>
          <div className="ml-4 font-mediums">Ace Sebastian</div>
        </div>
      </div>
      <div className="flex justify-end gap-x-4 mt-5 pt-5">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button variant="primary">
          Pay
        </Button>
      </div>
    </Modal>
  );
};
