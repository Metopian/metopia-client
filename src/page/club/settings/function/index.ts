import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { getAddress } from '../../../../utils/web3Utils'
import { snapshotApi, localRouter } from '../../../../config/urls'

export const domain = {
    "name": "snapshot",
    "version": "0.1.4"
};

export interface Space {
    from?: string;
    space: string;
    timestamp?: number;
    settings: string;
}

export const SpaceTypes = {
    Space: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'settings', type: 'string' }
    ]
}

export const sign = async (web3: Web3Provider | Wallet, address: string, message, types) => {
    // @ts-ignore
    const signer = web3?.getSigner ? web3.getSigner() : web3;
    if (!message.from) message.from = address;
    if (!message.timestamp)
        message.timestamp = parseInt((Date.now() / 1e3).toFixed());
    const data: any = { domain, types, message };
    const sig = await signer._signTypedData(domain, data.types, message);
    return { address, sig, data }
}

export const formToSettings = async (chainId, basicFormData, consensusForm, votingFormData) => {
    let account = await getAddress()
    let res = {
        ...basicFormData,
        voting: votingFormData,
        strategies: consensusForm.membership.map(c => {
            return {
                "name": "attributes-mul",
                "params": {
                    "symbol": c.name,
                    "address": c.tokenAddress,
                    "defaultWeight": c.defaultWeight * 100,
                    "network": chainId.indexOf("0x") === 0 ? chainId.substrtring(2) : chainId,
                    "traitTypeValueWeight": c.bonus?.filter(b => b.value?.length).map(b => {
                        return {
                            "trait_type": b.field,
                            "value_list": b.value.map(v => {
                                return {
                                    "value": v.value,
                                    "weight": 1 + b.weight * 0.01
                                }
                            })
                        }
                    }) || []
                }
            }
        }), validation: {
            name: "basic",
            params: {}
        },
        filters: {},
        about: basicFormData.introduction,
        admins: [account],
        plugins: [],
        categories: [],
        network: chainId.indexOf("0x") === 0 ? chainId.substrtring(2) : chainId,
        symbol: 'Vote',
    }
    return res
}

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
        votingFormData: {
            delay: 0,
            period: 3600,
            quorum: 0
        },
        network: null

    }
}

export const settingsToForm = (settings: string) => {
    if (!settings?.length) {
        return defaultForm()
    }
    let obj = JSON.parse(settings)
    let basicFormData = {
        name: obj.name,
        introduction: obj.about,
        website: obj.website,
        discord: obj.discord,
        twitter: obj.twitter,
        opensea: obj.opensea,
        avatar: obj.avatar,
        banner: obj.banner
    }
    let consensusForm = {
        membership: obj.strategies.map((s, i) => {
            return {
                id: i + 1,
                editing: false,
                name: s.params.symbol,
                tokenAddress: s.params.address,
                defaultWeight: s.params.defaultWeight / 100,
                bonus: s.params.traitTypeValueWeight?.length ? s.params.traitTypeValueWeight.map(b => {
                    return {
                        field: b.trait_type,
                        value: b.value_list.map(v => {
                            return {
                                value: v.value,
                                weight: (v.weight - 1) * 100
                            }
                        })
                    }
                }) : [],
            }
        })
    }
    let votingFormData = obj.voting
    return { basicFormData, consensusForm, votingFormData, network: obj.network }
}

export const snapshotDataToForm = (data) => {

    let basicFormData = {
        name: data.name,
        introduction: data.about,
        website: data.domain,
        discord: data.discord,
        twitter: data.twitter,
        opensea: '',
        avatar: data.avatar,
        banner: '',
    }

    let votingFormData = Object.assign({}, data.voting, { quorum: 0 })
    let d = data.strategies?.filter(s => s.name === 'erc721' && s.network === '1')
    let consensusForm = {
        admins: data.admins,
        membership: d?.length ? d.map((s, i) => {
            return {
                id: i + 1,
                editing: false,
                name: s.params.symbol,
                tokenAddress: s.params.address,
                defaultWeight: 1,
                bonus: []
            }
        }) : []
    }

    return { basicFormData, consensusForm, votingFormData, network: data.network }
}

export const doCreateDao = (settings, cb) => {
    fetch(snapshotApi.dao_create, {
        method: 'post',
        body: JSON.stringify({ id: settings.name, settings: JSON.stringify(settings) })
    }).then(r => r.json()).then((r) => {
        if (r.code === 200) {
            fetch("https://ai.metopia.xyz/gov-api/api/loadspaces").then(r2 => {
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
    fetch(snapshotApi.dao_update, {
        method: 'post',
        body: JSON.stringify({ id: id, settings: JSON.stringify(settings) })
    }).then(r => r.json()).then((r) => {
        if (r.code === 200) {
            fetch("https://ai.metopia.xyz/gov-api/api/loadspaces").then(r2 => {
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