import { useSelector } from 'react-redux';
import useSWR from "swr";
import { chainId, moralisApiToken } from '../../../config/constant';
import type { RootState } from '../../../config/store';
const fetcher = (url, token) => fetch(url, {
    headers: {
        'x-api-key': token
    }
}).then((res) => res.json())

const useFungibles = (address?) => {
    const user = useSelector((state: RootState) => state.user)
    const { data, error } = useSWR(((user.wallet && user.wallet.account) || address) ?
        [`https://deep-index.moralis.io/api/v2/${address || user.wallet.account}/erc20?chain=${chainId}`,
            moralisApiToken] : null, fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}
export { useFungibles };
