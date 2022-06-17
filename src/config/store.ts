import { configureStore, createSlice } from '@reduxjs/toolkit'
import { useCookies } from 'react-cookie'
import { defaultChainId } from './constant'
import { formSlice } from './redux/formSlice'
import { loginModalSlice } from './redux/loginModalSlice'
import userReducer from './redux/userSlice'

const globalConfigSlice = createSlice({
    name: 'config',
    initialState: {
        chainId: defaultChainId
    },
    reducers: {
        setChainId: (state, action) => {
            state.chainId = action.payload
        }
    },
})

const store = configureStore({
    reducer: {
        config: globalConfigSlice.reducer,
        user: userReducer,
        loginModal: loginModalSlice.reducer,
        form: formSlice.reducer
    },
})

export const useChainId = (): { chainId: string, setChainId: Function } => {
    const [cookies, setCookie] = useCookies(['chainId']);
    return {
        chainId: cookies.chainId || defaultChainId,
        setChainId: (chainId) => setCookie("chainId", chainId, { path: '/' })
    }
}

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
    config: {
        chainId: string
    },
    loginModal: any,
    form: any
}

export const { setChainId } = globalConfigSlice.actions
export { type RootState }
export type AppDispatch = typeof store.dispatch
export default store

