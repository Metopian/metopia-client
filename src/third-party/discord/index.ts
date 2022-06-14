import useSWR from "swr";

import { defaultSWRConfig, encodeQueryData, getFetcher, postFetcher } from '../../utils/RestUtils'
import { thirdpartyApi } from "../../config/urls";

const useDiscordData = (wallet: string, code?: string ) => {
    const { data, error } = useSWR([thirdpartyApi.discord_api, {
        redirect_uri: "http://localhost:3000/alpha/profile?subpage=discord",
        state: wallet, code: code
    }], getFetcher, defaultSWRConfig)
    return { data, error }
}

export { useDiscordData }