import { createReducer, on } from "@ngrx/store";
import * as UserActions from "./user.actions";
import { User } from "../../interfaces";

export interface State {
  id: number,
  users: User[],
}

export const initialState: State = {
  id: 0,
  users: []
}

export const userReducer = createReducer(
  initialState,
  on(UserActions.upserts, (state, { payload }) => ({...upserts(state, payload)})),
  on(UserActions.remove, (state, { payload }) => ({...remove(state, payload)}))
);

const upserts = (state: State, payload: User[]) => {
  let latestId = state.id;
  
  const users = payload.map((user: User) => {
    if (user.id) {
      return user;
    };

    latestId += 1;
    return {...user , id: latestId};
  });

  return {...state, id: latestId, users: users};
};

const remove = (state: State, payload: User): State => {
  // Remove User from the array
  const users = state.users.filter((user) => user.id !== payload.id)
  // Update positions
    .map((item, index)=> {
      return {...item, position: 1 + index}
    });

  return {...state, users};
}