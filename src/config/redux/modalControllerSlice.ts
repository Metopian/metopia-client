import { createSlice } from '@reduxjs/toolkit'

export const modalController = createSlice({
    name: 'modalController',
    initialState: {
        loginModal: {
            isShow: false,
            stepRequired: 2
        },
        userProfileEditorModal: {
            isShow: false,
            user: null
        }
    },
    reducers: {
        hideLoginModal: (state) => {
            state.loginModal.isShow = false
        },
        displayLoginModal: (state, action) => {
            state.loginModal.isShow = true
            state.loginModal.stepRequired = action.payload
        },
        hideUserProfileEditorModal: (state) => {
            state.userProfileEditorModal.isShow = false
        },
        displayUserProfileEditorModal: (state, action) => {
            state.userProfileEditorModal.isShow = true
            state.userProfileEditorModal.user = action.payload
        }
    },
})

export const { hideLoginModal, displayLoginModal, hideUserProfileEditorModal, displayUserProfileEditorModal } = modalController.actions