import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { domain } from '../../../../config/snapshotConfig'
import { localRouter, snapshotApi } from '../../../../config/urls'
import { unitNumToText, unitTextToNum } from '../../../../module/form'
import { toFixedIfNecessary } from '../../../../utils/numberUtils'
import { getAddress } from '../../../../utils/web3Utils'
import { unique } from '../../../../utils/stringUtils'

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

const bonusFormToStrategy = (bonus) => {
    if (!bonus?.length)
        return []
    let strategyParams = []
    let holdingPeriodBonus = bonus.filter(b => {
        return b.type === 1 && b.weight > 1 && b.value > 0 && toFixedIfNecessary(b.value / b.field, 2) !== 0
    })
    let attributesBonus = bonus.filter(b => {
        return b.type === 2 && b.weight > 1 && b.value.length > 0
    })
    if (holdingPeriodBonus.length) {
        strategyParams.push({
            "name": "holding-time",
            "defaultWeight": 100,
            "traitTypeValueWeight": holdingPeriodBonus.map(b => {
                let unitText = unitNumToText(b.field)
                return {
                    "trait_type": unitText.substring(0, unitText.length - 1),
                    "trait_value": toFixedIfNecessary(b.value / b.field, 2),
                    "weight": 1 + b.weight * 0.01
                }
            })
        })
    }
    if (attributesBonus.length) {
        strategyParams.push({
            "name": "attributes-mul",
            "defaultWeight": 100,
            "traitTypeValueWeight": attributesBonus.map(b => {
                return {
                    "trait_type": b.field,
                    "value_list": b.value.map(v => {
                        return {
                            "value": v.value,
                            "weight": 1 + b.weight * 0.01
                        }
                    })
                }
            })
        })
    }
    return strategyParams
}

const bonusStrategyToForm = (traitValues) => {
    if (!traitValues?.length)
        return []
    let res = []
    let idCounter = 1
    traitValues.filter(t => t.name === 'holding-time').forEach(traitValue => {
        traitValue.traitTypeValueWeight.forEach(t => {
            res.push({
                id: idCounter++,
                type: 1,
                field: unitTextToNum(t.trait_type),
                value: t.trait_value * unitTextToNum(t.trait_type),
                weight: toFixedIfNecessary((t.weight - 1) * 100, 2)
            })
        });
    })
    traitValues.filter(t => t.name === 'attributes-mul').forEach(traitValue => {
        console.log(traitValue)
        traitValue.traitTypeValueWeight.forEach(t => {
            res.push({
                id: idCounter++,
                type: 2,
                field: t.trait_type,
                value: t.value_list.map(v => { return { text: v.value, value: v.value } }),
                weight: (t.value_list[0].weight - 1) * 100
            })
        })
    })
    return res
}

export const formToSettings = (chainId, basicFormData, consensusForm, votingFormData) => {
    let res = {
        ...basicFormData,
        voting: votingFormData,
        strategies: consensusForm.membership.map(c => {
            console.log(bonusFormToStrategy(c.bonus))
            return {
                "name": "collect",
                "params": {
                    "symbol": c.name,
                    "address": c.tokenAddress,
                    // "defaultWeight": c.defaultWeight * 100,
                    "network": chainId.indexOf("0x") === 0 ? chainId.substring(2) : chainId,
                    "method": 'MUL',
                    "traitValues": bonusFormToStrategy(c.bonus)
                }
            }
        }),
        validation: {
            name: "basic",
            params: {}
        },
        filters: {},
        about: basicFormData.introduction,
        admins: unique(basicFormData.admins.map(admin => admin.addres)),
        plugins: [],
        categories: [],
        network: chainId.indexOf("0x") === 0 ? chainId.substring(2) : chainId,
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
                bonus: bonusStrategyToForm(s.params.traitValues)
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