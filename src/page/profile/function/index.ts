import useSWR from "swr"
import { userApi } from "../../../config/urls"
import { getAddress, sign } from "../../../utils/web3Utils"
import { compareIgnoringCase } from "../../../utils/stringUtils"
import { defaultSWRConfig, getFetcher, encodeQueryData } from "../../../utils/RestUtils"

export const updateAccount = (owner, username, avatar, introduction) => {
    return new Promise((accept, reject) => {
        let msg = { owner, username, avatar, introduction, timestamp: parseInt(new Date().getTime() / 1000 + '') }
        console.log(msg)
        sign(JSON.stringify(msg)).then(signature => {
            console.log(signature)
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
    return fetch(userApi.user_update + owner).then(d => d.json())
}

export const useAccountData = (owner) => {
    const { data, error } = useSWR([userApi.user_update + owner, { owner }], getFetcher, defaultSWRConfig)
    return { data, error }
}