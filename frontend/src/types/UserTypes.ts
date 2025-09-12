import { PermissionType } from "./PermissionTypes";
import { RoleType } from "./RoleTypes";

type UserType = {
  id: number;
  first_name: string;
  last_name: string;   
  display_name:string;
  mobile_phone: string;
  phone: string;
  website: string;    
  email: string;
  color: string;
  roles: RoleType[],
  sort_order: number,
  extra_permissions: PermissionType[]
  gender?: string | null; // ✅ Allow string
  title: string;
  job: string;
  has_personal_calendar: boolean
  description: string;
  image:string;
  created_at: string;
  updated_at: string;
}
type InitialState = {
  users: UserType[];
  isLoading: boolean;
  resStatus?: string;
  componentType?: string;
  msg: string;
  error: Error | null;
}


export type { UserType, InitialState}