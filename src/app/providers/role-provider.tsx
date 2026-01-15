"use client";

import { useEffect, useState } from "react";
import { Select } from "../components/common";
import { User } from "lucide-react";
import { getAllRoles } from "@/app/actions/staff/get_all_roles";
import { ROLE_ADMIN } from "@/app/types/role";

export function RoleProvider({
  placeholder = "Select Role",
  excludeAdmin = false,
  ...props
}) {
  const [roleList, setRoleList] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await getAllRoles();

        if (error) throw error;

        let filteredData = data || [];

        // Filter out ADMIN role if excludeAdmin is true
        if (excludeAdmin) {
          filteredData = filteredData.filter((item) => item.name !== ROLE_ADMIN);
        }

        const options =
          filteredData.map((item) => ({ value: item.id, label: item.name }));

        setRoleList(options);
      } catch (error) {
        setRoleList([]);
      }
    })();
  }, [excludeAdmin]);

  return (
    <Select
      icon={<User />}
      options={roleList}
      isSearchable={false}
      placeholder={placeholder}
      {...props}
    />
  );
}
