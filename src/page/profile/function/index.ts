import { json } from "stream/consumers"
import useSWR from "swr"
import { userApi } from "../../../config/urls"
import { getAddress } from "../../../utils/web3Utils"

export const update = (owner, username, avatar, introduction) => {
    return new Promise((accept, reject) => {
        getAddress().then(addr => {
            if (addr.toLowerCase() !== owner.toLowerCase)
                reject("No authority to modify other users' profile")
            fetch(userApi.user_update + addr, {
                method: 'PUT',
                body: JSON.stringify({
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

export const useOwnerData = (owner) => {
    return useSWR([owner], selectByOwner)
}