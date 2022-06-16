import useSWR from "swr";
import { moralisApiToken } from '../../../config/constant';
import { useChainId } from '../../../config/store';
const fetcher = (url, token) => fetch(url, {
    headers: {
        'x-api-key': token
    }
}).then((res) => res.json())

const useNfts = (address?: string, chainId?: string) => {
    const defaultChainId = useChainId()
    const { data, error } = useSWR((address) ? [`https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chainId || defaultChainId}&format=decimal`,
        moralisApiToken] : null, fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}
export { useNfts };
