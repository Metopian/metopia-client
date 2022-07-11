import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { domain } from '../../../../config/snapshotConfig'
import { localRouter, snapshotApi } from '../../../../config/urls'
import { sign } from '../../../../utils/web3Utils'

// export const sign = async (web3: Web3Provider | Wallet, address: string, message, types) => {
//     // @ts-ignore
//     const signer = web3?.getSigner ? web3.getSigner() : web3;
//     if (!message.from) message.from = address;
//     if (!message.timestamp)
//         message.timestamp = parseInt((Date.now() / 1e3).toFixed());
//     const data: any = { domain, types, message };
//     const sig = await signer._signTypedData(domain, data.types, message);
//     return { address, sig, data }
// }


export const defaultForm = () => {
    return {
        basicFormData: {
            name: '',
            introduction: '',
            website: '',
            discord: '',
            twitter: '',
            opensea: '',
            avatar: '',
            banner: '',
        },
        consensusForm: { membership: [] },
        votingForm: {
            delay: 0,
            period: 3600,
            quorum: 0
        },
        proposalForm: {
            validation: {
                name: "basic",
                params: {}
            },
            filters: { onlyMembers: false, minScore: 0 }
        },
        network: null
    }
}

export const doCreateDao = (settings, cb) => {
    sign(JSON.stringify(settings)).then(signature => {
        return fetch(snapshotApi.dao_create, {
            body: JSON.stringify({ id: settings.name, settings: JSON.stringify(settings), signature: signature }),
            method: 'post',
        })
    }).then(r => r.json()).then((r) => {
        if (r.code === 200) {
            fetch(snapshotApi.loadSpaces).then(r2 => {
                return r2.json()
            }).then(r3 => {
                window.location.href = localRouter('club.prefix') + r.content
            }).finally(cb)
        } else {
            window.alert('Dao creation Failed')
            cb()
        }
    }).catch(cb)

}

export const doUpdateDao = (id, settings, cb) => {
    sign(JSON.stringify(settings)).then(signature => {
        return fetch(snapshotApi.dao_update, {
            method: 'post',
            body: JSON.stringify({ id: id, settings: JSON.stringify(settings), signature: signature })
        })
    }).then(r => r.json()).then((r) => {
        if (r.code === 200) {
            fetch(snapshotApi.loadSpaces).then(r2 => {
                return r2.json()
            }).then(r3 => {
                window.location.href = localRouter('club.prefix') + r.content
            }).finally(cb)
        } else {
            window.alert('Dao creation Failed')
            cb()
        }
    }).catch(cb)
}

export * from './settingsFormatParser'
