import { useSelector } from 'react-redux';
import useSWR from "swr";
import type { RootState } from '../config/store';
const fetcher = (url) => fetch(url).then((res) => res.json())

const useAiResult = () => {
    const user = useSelector((state: RootState) => state.user)

    const { data, error } = useSWR(user.wallet && user.wallet.account ? [`https://ai.metopia.xyz/api/imgs/${user.wallet.account}`] : null, fetcher, {
        // const { data, error } = useSWR(user.wallet && user.wallet.account ? [`https://metopia.xyz/api/imgs/${user.wallet.account}`] : null, fetcher, {
        refreshInterval: 10000
    })
    return { data, error }
}
export default useAiResult