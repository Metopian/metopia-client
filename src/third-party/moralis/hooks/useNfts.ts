import useSWR from "swr";
import { useSelector } from 'react-redux'
import type { RootState } from '../../../config/store'
import { moralisApiToken } from '../../../config/constant'
const fetcher = (url, token) => fetch(url, {
    headers: {
        'x-api-key': token
    }
}).then((res) => res.json())

const useNfts = (address?: string, chainId?: string) => {
    const { data, error } = useSWR((address) ? [`https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chainId || '0x1'}&format=decimal`,
        moralisApiToken] : null, fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}
export { useNfts }