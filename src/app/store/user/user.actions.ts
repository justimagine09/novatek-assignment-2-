import { createAction, props } from "@ngrx/store";
import { User } from "../../interfaces";

export const upserts = createAction(
  '[User] Upserts',
  props<{payload: User[]}>()
);

export const remove = createAction(
  '[User] Remove',
  props<{payload: User}>()
);