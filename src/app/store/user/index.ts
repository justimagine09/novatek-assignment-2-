import { createFeature } from "@ngrx/store";
import { userReducer } from "./user.reducer";
export * as userActions from "./user.actions";
 
export const userFeature = createFeature({
  name: 'users',
  reducer: userReducer
});

export const {
  name,
  reducer,
  selectUsers
} = userFeature;