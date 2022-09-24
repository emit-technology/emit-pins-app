import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

export interface Role {
    roleId: number
    roleAvator: string
    roleName: string
    amount: string
}

const initialState = { roleId: 0, roleAvator: '', roleName:'' , amount: ''} as Role;

export const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        saveRoleState: (state, action: PayloadAction<any>) => {
            state.roleId = action.payload.roleId
            state.roleAvator = action.payload.roleAvator
            state.roleName = action.payload.roleName
            state.amount = action.payload.amount
        }
    }
})


export const { saveRoleState } = roleSlice.actions
export const getRole = (state: RootState) => state.loadStateSlice

export const roleReducer = roleSlice.reducer