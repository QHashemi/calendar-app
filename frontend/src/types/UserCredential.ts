import { UserType } from "./UserTypes";

type AccessTokenType = {
  user?: { id: any; email: string };
  iat: number | undefined;
  exp: number;
};

type InitialState = {
  user: UserType;
  isLoggedIn: boolean;
  isLoading: boolean;
  resStatus?: string;
  componentType?: string;
  msg: string;
  error: Error | null;
  accessToken: string;
  persist:boolean
};



export type { InitialState, AccessTokenType };
