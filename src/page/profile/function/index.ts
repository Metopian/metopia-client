import useSWR from "swr"
import { userApi } from "../../../config/urls"
import { getAddress } from "../../../utils/web3Utils"
import { compareIgnoringCase } from "../../../utils/stringUtils"
import { defaultSWRConfig, getFetcher, encodeQueryData } from "../../../utils/RestUtils"

export const updateAccount = (owner, username, avatar, introduction) => {
    return new Promise((accept, reject) => {
        getAddress().then(addr => {
            if (!compareIgnoringCase(addr, owner))
                reject("No authority to modify other users' profile")
            fetch(userApi.user_update + addr, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: encodeQueryData(null, {
                    username,
                    avatar,
                    introduction
                })
            }).then(d => {
                return d.json()
            }).then(d => {
                if (d.code === 0) {
                    accept(d)
                } else {
                    reject(d.msg)
                }
            })
        }).catch(e => {
            console.error(e)
            reject("Internal error")
        })
    })
}

export const selectByOwner = (owner) => {
    return fetch(userApi.user_update + owner).then(d => d.json())
}

export const useAccountData = (owner) => {
    const { data, error } = useSWR([userApi.user_update + owner, { owner }], getFetcher, defaultSWRConfig)
    return { data, error }
}