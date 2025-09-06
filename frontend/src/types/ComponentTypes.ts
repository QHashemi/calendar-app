import { PermissionType } from "./PermissionTypes";
import { RoleType } from "./RoleTypes";
import { UserType } from "./UserTypes";

interface ComponentType {
  id: number;
  name: string;
  roles: RoleType[];
  permissions: PermissionType[];
  order: number;
  created_by: UserType
}

interface InitialState {
  components: ComponentType[];
  resStatus: string;
  componentType: string;
  isLoading: boolean;
  msg: string;
  error: any;
}

export type {InitialState, ComponentType}