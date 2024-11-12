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
  on(UserActions.add, (state, { payload }) => ({...add(state, payload)})), 
  on(UserActions.update, (state, { payload }) => ({...update(state, payload)})),
  on(UserActions.remove, (state, { payload }) => ({...remove(state, payload)}))
);

const add = (state: State, payload: User): State => {
  const latestId = state.id + 1;
  const newPayload = {...payload, id: latestId, position: state.users.length};

  return {...state, id: latestId, users: [...state.users, newPayload]};
};

const update = (state: State, payload: User): State => {
  const index = state.users.findIndex(user => user.id == payload.id);
  const users = [...state.users];
  users.splice(index, 1, payload);

  return {...state, users};
}

const remove = (state: State, payload: User): State => {
  // Remove User from the array
  const users = state.users.filter((user) => user.id !== payload.id)
  // Update positions
    .map((item, index)=> {
      return {...item, position: 1 + index}
    });

  return {...state, users};
}