import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import {Message} from "../../../types";

interface DataState {
    data: string
    tag: string
}

const initialState:DataState = { data: "", tag: "" };

export const messageSlice = createSlice({
    name: 'jsonData',
    initialState,
    reducers: {
        saveMessageState: (state, action?: PayloadAction<any>) => {
            state.data = action.payload.data
            state.tag = action.payload.tag
        }
    }
})


export const { saveMessageState } = messageSlice.actions

export const getMessageState = (state: RootState) => state.jsonData

export const messageReducer = messageSlice.reducer