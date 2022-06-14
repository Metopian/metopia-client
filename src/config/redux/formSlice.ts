import { createSlice } from '@reduxjs/toolkit'

export const formSlice = createSlice({
    name: 'form',
    initialState: {
        form: {}
    },
    reducers: {
        update: (state, action) => {
            let key = action.payload.key
            let val = action.payload.value
            state.form[key] = val
            // state.isShow = true
            // state.stepRequired = action.payload
        }
    },
})


export const { update } = formSlice.actions