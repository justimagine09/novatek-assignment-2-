import { createAction, props } from "@ngrx/store";
import { User } from "../../interfaces";

export const add = createAction(
  '[User] Add',
  props<{payload: User}>()
);

export const update = createAction(
  '[User] Update',
  props<{payload: User}>()
);

export const remove = createAction(
  '[User] Remove',
  props<{payload: User}>()
);