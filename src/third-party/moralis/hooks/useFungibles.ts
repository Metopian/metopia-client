import useSWR from "swr";
import { useSelector } from 'react-redux'
import type { RootState } from '../../../config/store'
import { moralisApiToken } from '../../../config/constant'
const fetcher = (url, token) => fetch(url, {
    headers: {
        'x-api-key': token
    }
}).then((res) => res.json())

const useFungibles = (address?) => {
    const user = useSelector((state: RootState) => state.user)
    const { data, error } = useSWR(((user.wallet && user.wallet.account) || address) ?
        [`https://deep-index.moralis.io/api/v2/${address || user.wallet.account}/erc20?chain=${'0x1'}`,
            moralisApiToken] : null, fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}
export { useFungibles }