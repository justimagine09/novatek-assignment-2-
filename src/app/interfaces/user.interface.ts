import { DropDown } from "./drop-down.interface";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  dropDown: DropDown | null;
  position?: number;
}