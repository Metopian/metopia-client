import { useSelector } from 'react-redux';
import useSWR from "swr";
import { moralisApiToken } from '../../../config/constant';
import { RootState, useChainId } from '../../../config/store';
const fetcher = (url, token) => fetch(url, {
    headers: {
        'x-api-key': token
    }
}).then((res) => res.json())

const useFungibles = (address?, chainId?) => {
    const defaultChainId = useChainId()
    const user = useSelector((state: RootState) => state.user)
    const { data, error } = useSWR(((user.wallet && user.wallet.account) || address) ?
        [`https://deep-index.moralis.io/api/v2/${address || user.wallet.account}/erc20?chain=${chainId || defaultChainId}`,
            moralisApiToken] : null, fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}
export { useFungibles };
