import { UserType } from "./UserTypes";

type EventType = {
  id: number;
  title: string;
  start: string;       
  end: string;
  color: string;
  description?: string;
  note: string;
  owner:UserType;
  is_all_day: boolean;
  is_ms_event:boolean;
  organizer:UserType;
  location:string;
  helpers:UserType[];
    created_by: UserType
  created_at: string;
  updated_at: string;

}

 type EventWithColumn = EventType & {
                    column: number;
                    totalColumns: number;
                  };

type InitialState = {
  events: EventType[];
  isLoading: boolean;
  resStatus?: string;
  componentType?: string;
  msg: string;
  error: Error | null;
}


export type { EventType, InitialState, EventWithColumn}