import useSWR from "swr"
import { userApi } from "../config/urls"
import { getAddress, sign } from "../utils/web3Utils"
import { compareIgnoringCase } from "../utils/stringUtils"
import { defaultSWRConfig, getFetcher, encodeQueryData } from "../utils/RestUtils"

export const updateAccount = (owner, username, avatar, introduction) => {
    return new Promise((accept, reject) => {
        let msg = { owner, username, avatar, introduction, timestamp: parseInt(new Date().getTime() / 1000 + '') }
        sign(JSON.stringify(msg)).then(signature => {
            return fetch(userApi.user_update + owner, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'msg': JSON.stringify(msg),
                    'signature': signature
                },
                body: encodeQueryData(null, {
                    username,
                    avatar,
                    introduction
                })
            })
        }).then(d => {
            return d.json()
        }).then(d => {
            if (d.code === 0) {
                accept(d)
            } else {
                reject(d.msg)
            }
        }).catch(e => {
            console.error(e)
            reject("Internal error")
        })
    })
}

export const selectByOwner = (owner) => {
    return fetch(userApi.user_selectByOwner + owner).then(d => d.json())
}

export const selectByOwners = (owners) => {
    if (!owners?.length)
        return {}
    let tmp = owners.map(o => 'owners=' + o)

    return fetch(userApi.user_selectByOwners + "?" + tmp.join('&')).then(d => d.json())
}

export const useAccountData = (owner, nonce) => {
    const { data, error } = useSWR([userApi.user_update + owner, { owner,nonce }], getFetcher, defaultSWRConfig)
    return { data, error }
}

export const useAccountListData = (owners) => {
    const { data, error } = useSWR(owners?.length ? [userApi.user_selectByOwners + "?" + [...owners, ''].map(o => 'owners=' + o).join('&')] : null, getFetcher, defaultSWRConfig)
    return { data, error }
}