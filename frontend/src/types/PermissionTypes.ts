import { UserType } from "./UserTypes";

// Permission Types
type PermissionType = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
    created_by: UserType
};

type InitialState = {
  permissions: PermissionType[];
  isLoading: boolean;
  resStatus?: string;
  componentType?: string;
  msg: string;
  error: Error | null;
};

export type {PermissionType, InitialState}