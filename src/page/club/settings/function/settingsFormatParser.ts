import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { domain } from '../../../../config/snapshotConfig'
import { localRouter, snapshotApi } from '../../../../config/urls'
import { unitNumToText, unitTextToNum } from '../../../../module/form'
import { toFixedIfNecessary } from '../../../../utils/numberUtils'
import { getAddress } from '../../../../utils/web3Utils'
import { unique } from '../../../../utils/stringUtils'

/**
 * TODO 
 * 100->[1]
 */
const bonusFormToStrategy = (bonus) => {
    if (!bonus?.length)
        bonus = []
    let strategyParams = []
    let holdingPeriodBonus = bonus.filter(b => {
        return b.type === 1 && b.weight > 1 && b.value > 0 && toFixedIfNecessary(b.value / b.field, 2) !== 0
    })
    let attributesBonus = bonus.filter(b => {
        return b.type === 2 && b.weight > 1 && b.value.length > 0
    })
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
    console.log(strategyParams)
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
/**
 * Form object to settings json stored in database
 */
export const formToSettings = (chainId, basicFormData, consensusForm, proposalForm, votingFormData) => {
    let res = {
        ...basicFormData,
        ...proposalForm,
        strategies: consensusForm.membership.map(c => {
            return {
                "name": "collect",
                "params": {
                    "symbol": c.name,
                    "address": c.tokenAddress,
                    "network": chainId.indexOf("0x") === 0 ? chainId.substring(2) : chainId,
                    "method": 'MUL',
                    "traitValues": bonusFormToStrategy(c.bonus)
                }
            }
        }),
        about: basicFormData.introduction,
        admins: unique(basicFormData.admins.map(admin => admin.address)),
        plugins: [],
        categories: [],
        network: chainId.indexOf("0x") === 0 ? chainId.substring(2) : chainId,
        symbol: 'Vote',
        voting: votingFormData
    }
    return res
}

/**
 * @param settings Settings json stored in database
 * @returns Form object
 */
export const settingsToForm = (settings: string) => {
    if (!settings?.length) {
        return null
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
        banner: obj.banner,
        admins: obj.admins.map((admin, i) => {
            return {
                id: i + 1,
                address: admin
            }
        })
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
    let votingForm = obj.voting
    let proposalForm = {
        mode: obj.validation?.name === 'discord' ? 2 : (obj.filters?.onlyMembers ? 1 : 0),
        filters: obj.filters,
        validation: obj.validation,
        members: obj.members
    }
    return { basicFormData, consensusForm, votingForm, proposalForm, network: obj.network }
}

/**
 * Import data from Snapshot.org database
 */
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
        admins: data.admins.map((admin, i) => {
            return {
                id: i + 1,
                address: admin
            }
        })
    }

    let votingForm = Object.assign({}, data.voting, { quorum: 0 })
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
    let proposalForm = {
        mode: (data.filters?.onlyMembers ? 1 : 0),
        filters: data.filters,
        validation: data.validation,
        members: data.members
    }

    return { basicFormData, consensusForm, votingForm, proposalForm, network: data.network }
}
