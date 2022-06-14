import { createSlice } from '@reduxjs/toolkit'


export const userSlice = createSlice({
    name: 'user',
    initialState: {
        wallet: window.localStorage && window.localStorage.getItem("user") ?
            JSON.parse(window.localStorage.getItem("user") || '{}').wallet : null,
        account: window.localStorage && window.localStorage.getItem("user") ?
            JSON.parse(window.localStorage.getItem("user") || '{}').account : null,
    },
    reducers: {
        setWallet: (state, action) => {
            state.wallet = action.payload
            window.localStorage && window.localStorage.setItem('user', JSON.stringify(state))
        },
        setAccount: (state, action) => {
            state.account = action.payload
            window.localStorage && window.localStorage.setItem('user', JSON.stringify(state))
        },
        logout: (state) => {
            state.wallet = { account: null, chainId: null }
            state.account = null
            window.localStorage && window.localStorage.removeItem('user')
        }
    },
})

export const { setWallet, logout, setAccount } = userSlice.actions
export default userSlice.reducer