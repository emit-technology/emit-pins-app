import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

interface DataState {
    data: any
    tag: string
}

const initialState = { data: "", tag: "" } as DataState;

export const dataSlice = createSlice({
    name: 'jsonData',
    initialState,
    reducers: {
        saveDataState: (state, action?: PayloadAction<any>) => {
            state.data = action.payload.data
            state.tag = action.payload.tag
        }
    }
})


export const { saveDataState } = dataSlice.actions

export const getDataState = (state: RootState) => state.jsonData

export const dataReducer = dataSlice.reducer