// Role Types

import { UserType } from "./UserTypes";

type PermissionType = {
  id: number,
  name: string,
  description?:string
    created_by: UserType
}

type RoleType = {
  id: number;
  name: string;
  description?: string;
  permissions: PermissionType[]; // array of permission names or IDs
  created_at: string;
  updated_at: string;
};

type InitialState = {
  roles: RoleType[];
  isLoading: boolean;
  resStatus?: string;
  componentType?: string;
  msg: string;
  error: Error | null;
};


export type {RoleType, InitialState}