"use client";

import { ROLE_ADMIN } from "@/app/types";
import { createContext, PropsWithChildren, useContext } from "react";

export type UserType = {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  address: string;
  employment_date: string;
  role_id: string;
  role_name: string;
  branch_id: string;
  branch_name: string;
  is_admin: boolean;
};

const UserContext = createContext<UserType | undefined>(undefined);

export const UserContextProvided = ({
  user,
  children,
}: { user: UserType } & PropsWithChildren) => {
  return (
    <UserContext.Provider
      value={{ ...user, is_admin: user?.role_name === ROLE_ADMIN }}
    >
      {" "}
      {children}{" "}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }

  return context;
};
