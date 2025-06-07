"use client";

import { useEffect, useState } from "react";

import { Button, Input, Modal } from "@/app/components/common";

import { getAllServices } from "@/app/actions";
import { CheckIcon } from "@heroicons/react/20/solid";

type PaymentModalProps = {
  show: boolean;
  grossTotal: string;
  onClose: () => void;
  onSubmit: () => void;
};

export const PaymentModal = ({
  show,
  grossTotal,
  onClose,
  onSubmit,
}: PaymentModalProps) => {
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
