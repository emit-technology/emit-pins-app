import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

export interface LoadState {
    tag: string
    state: number
}

const initialState = { tag: "", state: 0 } as LoadState;

export const loadStateSlice = createSlice({
    name: 'loadstate',
    initialState,
    reducers: {
        saveLoadState: (state, action: PayloadAction<any>) => {
            state.tag = action.payload.tag
            state.state = action.payload.state
        }
    }
})


export const { saveLoadState } = loadStateSlice.actions
export const getLoadState = (state: RootState) => state.loadStateSlice

export const loadStateReducer = loadStateSlice.reducer