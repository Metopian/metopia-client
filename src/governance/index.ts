
import useSWR from "swr";
import { snapshotApi } from '../config/urls';

export interface ResponsePack<T> {
    code: number,
    content: T
}

export interface Space {
    id: string,
    settings: string,
    verified: number,
    createAt: number,
    updateAt?: number,
    proposalCount?: number
}

const defaultSWRConfig = {
    refreshInterval: 0,
    revalidateOnFocus: false
}

const encodeQueryData = (url, data) => {
    if (!data || !Object.keys(data))
        return url
    const ret = [];
    for (let d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return url + "?" + ret.join('&');
}

const getFetcher = (url, params?) => fetch(encodeQueryData(url, params)).then((res) => res.json())

const postFetcher = (url, params) => fetch(url, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
        'content-type': "application/json"
    }
}).then((res) => res.json())

const useSpaceListData = (): { data: ResponsePack<Space[]>, error: any } => {
    const { data, error } = useSWR([snapshotApi.dao_select], getFetcher, defaultSWRConfig)
    return { data, error }
}
const useSpaceData = (id: string): { data: ResponsePack<Space>, error: any } => {
    const { data, error } = useSWR(id?[snapshotApi.dao_selectById, { id: id }]:null, getFetcher, defaultSWRConfig)
    return { data, error }
}

const useScoreData = (space?: string, network?: string, snapshot?: number, strategies?: string, addresses?: string[]) => {
    let scoreParam = { "params": { space, network, snapshot, strategies, addresses } }
    const { data, error } = useSWR(space && addresses?.length ? [snapshotApi.score, scoreParam] : null, postFetcher, defaultSWRConfig)
    return { data, error }
}

const useProposal = (id) => {
    let proposalParam = {
        "operationName": "Proposal",
        "variables": {
            "id": id
        },
        "query": "query Proposal($id: String!) {\n  proposal(id: $id) {\n    id\n    ipfs\n    title\n    body\n    choices\n    start\n    end\n    snapshot\n    state\n    author\n    created\n    plugins\n    network\n    type\n    strategies {\n      name\n      params\n    }\n    space {\n      id\n      name\n    }\n    scores_state\n    scores\n    scores_by_strategy\n    scores_total\n    votes\n  }\n}"
    }
    const { data, error } = useSWR(id && [snapshotApi.graphql, proposalParam], postFetcher, defaultSWRConfig)
    return { data: data?.data?.proposal, error }
}


const useLatestProposalData = (): { data: ResponsePack<Space[]>, error: any } => {
    const { data, error } = useSWR([snapshotApi.proposal_selectLatest], getFetcher, defaultSWRConfig)
    return { data, error }
}

export { defaultSWRConfig, getFetcher, useSpaceListData, useSpaceData, useScoreData, useProposal, useLatestProposalData };

