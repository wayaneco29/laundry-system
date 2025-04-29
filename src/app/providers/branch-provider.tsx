"use client";

import { Props } from "react-select";
import { ChangeEvent, useEffect, useState } from "react";

import { getAllBranches } from "../actions";

import { Select } from "../components/common";

type BranchProviderProps = Props & {
  multiple?: boolean;
  label?: string;
  error?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string | string[];
  placeholder?: string;
};

export function BranchProvider({ placeholder, ...props }: BranchProviderProps) {
  const [branchList, setBranchList] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    (async () => {
      const { data } = await getAllBranches();

      const options = data?.map((item) => ({
        value: item?.id,
        label: item?.name,
      }));

      setBranchList(options);
    })();
  }, []);

  return <Select options={branchList} placeholder={placeholder} {...props} />;
}
