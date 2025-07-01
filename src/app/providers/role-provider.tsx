"use client";

import { useEffect, useState } from "react";
import { Select } from "../components/common";
import { User } from "lucide-react";
import { getAllRoles } from "@/app/actions/staff/get_all_roles";

export function RoleProvider({ placeholder = "Select Role", ...props }) {
  const [roleList, setRoleList] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await getAllRoles();

        if (error) throw error;

        const options =
          data?.map((item) => ({ value: item.id, label: item.name })) || [];

        setRoleList(options);
      } catch (error) {
        setRoleList([]);
      }
    })();
  }, []);

  return (
    <Select
      icon={<User />}
      options={roleList}
      placeholder={placeholder}
      {...props}
    />
  );
}
