import { useSelector } from 'react-redux';
import useSWR from "swr";
import type { RootState } from '../../../config/store';
import type { WrappedSwapData } from '../type';
const uniswap_v3_url = "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph"

const fetcher = (url, address) => {
    let queryql = `{swaps(orderBy:timestamp orderDirection:desc where:{origin:"${address}"}){amountUSD amount0 amount1 timestamp token0{symbol} token1{symbol}}}`
    const load = { query: queryql, variables: null }
    return fetch(url, {
        method: 'post',
        body: JSON.stringify(load),
        mode: 'cors'
    }).then((res) => res.json())
}

export const useUniswapV3Data = (address?: string): {
    data: WrappedSwapData;
    error: any;
} => {
    const user = useSelector((state: RootState) => state.user)
    const { data, error } = useSWR(
        address || user.wallet.account ? [uniswap_v3_url, address || user.wallet.account] : null,
        fetcher,
        {
            refreshInterval: 0,
            revalidateOnFocus: false
        })
    return { data, error }
}

// export default useUniswapV3Data