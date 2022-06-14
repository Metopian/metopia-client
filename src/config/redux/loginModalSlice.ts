import { createSlice } from '@reduxjs/toolkit'

export const loginModalSlice = createSlice({
    name: 'loginModal',
    initialState: {
        isShow: false,
        stepRequired: 2
    },
    reducers: {
        hide: (state) => {
            state.isShow = false
        },
        display: (state, action) => {
            state.isShow = true
            state.stepRequired = action.payload
        }
    },
})

export const { hide: hideLoginModal, display: displayLoginModal } = loginModalSlice.actions