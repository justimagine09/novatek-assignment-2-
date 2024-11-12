import { createFeature } from "@ngrx/store";
import { userReducer } from "./user.reducer";

export const userFeature = createFeature({
  name: 'users',
  reducer: userReducer
});

export const {
  name,
  reducer,
  selectUsers
} = userFeature;