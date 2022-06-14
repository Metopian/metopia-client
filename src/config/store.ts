import { configureStore } from '@reduxjs/toolkit'
import { formSlice } from './redux/formSlice'
import { loginModalSlice } from './redux/loginModalSlice'
import userReducer from './redux/userSlice'

const store = configureStore({
    reducer: {
        user: userReducer,
        loginModal: loginModalSlice.reducer,
        form: formSlice.reducer
    },
})

declare type Wallet = {
    account?: string,
    chainId?: string
}
declare type Account = {
    username?: string,
    introduction?: string,
    avatar?: any
}
declare type RootState = {
    user: {
        wallet: Wallet,
        account: Account
    },
    loginModal: any,
    form:any
}

// export default 
export { type RootState }
// = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store