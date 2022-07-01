import useSWR from "swr";
import { discordApi } from "../../config/urls";
import { defaultSWRConfig, getFetcher, ResponsePack } from '../../utils/RestUtils';


declare interface Guild {
    guildId: string,
    name: string,
    icon: string,
    permissions: string
}

declare interface Role {
    "guildId": string,
    "roleId": string,
    "name": string,
    // 0 for default
    "position": number,
}



const usePersonalDiscordData = (wallet: string, code?: string) => {
    const { data, error } = useSWR([discordApi.personal_auth, {
        redirect_uri: "http://localhost:3000/alpha/profile?subpage=discord",
        state: wallet, code: code
    }], getFetcher, defaultSWRConfig)
    return { data, error }
}

const useGuildsData = (): {
    data: {
        code: number,
        msg: string,
        data: { guilds: Guild[] }
    }, error: any
} => {
    const { data, error } = useSWR([discordApi.guild_selectAll], getFetcher, defaultSWRConfig)
    return { data, error }
}

const useRolesData = (guildId: string): {
    data: {
        code: number,
        msg: string,
        data: { roles: Role[] }
    }, error: any
} => {
    const { data, error } = useSWR(guildId?.length ? [discordApi.role_select, { guildId: guildId }] : null, getFetcher, defaultSWRConfig)
    return { data, error }
}

export { usePersonalDiscordData, useGuildsData, useRolesData };
