import { createReducer, on } from "@ngrx/store";
import * as DogActions from "./user.actions";
import { User } from "../../interfaces";

export interface State {
  users: User[],
}

export const initialState: State = {
  users: []
}

export const userReducer = createReducer(
  initialState,
  on(DogActions.add, (state, { payload }) => ({...state, dogs: [...state.users, payload]})), 
  on(DogActions.update, (state, { payload }) => ({...update(state, payload)})),
  on(DogActions.remove, (state, { payload }) => ({...remove(state, payload)}))
);

const update = (state: State, payload: User): State => {
  const index = state.users.findIndex((user) => user.id === payload.id);
  state.users[index] = payload;
  return state;
}

const remove = (state: State, payload: User): State => {
  return {...state, users: state.users.filter((user) => user.id !== payload.id)};
}