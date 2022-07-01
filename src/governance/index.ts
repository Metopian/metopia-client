
import useSWR from "swr";
import { snapshotApi } from '../config/urls';
import { defaultSWRConfig, getFetcher, postFetcher, ResponsePack } from "../utils/RestUtils";

export interface Dao {
    id: string,
    settings: string,
    verified: number,
    createAt: number,
    updateAt?: number,
    proposalCount?: number
}

const useDaoListData = (): { data: ResponsePack<Dao[]>, error: any } => {
    const { data, error } = useSWR([snapshotApi.dao_select], getFetcher, defaultSWRConfig)
    return { data, error }
}
const useDaoData = (id: string): { data: ResponsePack<Dao>, error: any } => {
    const { data, error } = useSWR(id ? [snapshotApi.dao_selectById, { id: id }] : null, getFetcher, defaultSWRConfig)
    return { data, error }
}

const useScoreData = (dao: string, network: string, snapshot: number, strategies: string, addresses?: string[]) => {
    let scoreParam = { "params": { space: dao, network, snapshot, strategies, addresses } }
    const { data, error } = useSWR(dao && addresses?.length && strategies && snapshot ? [snapshotApi.score, scoreParam] : null, postFetcher, defaultSWRConfig)
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

const useLatestProposalData = (): { data: ResponsePack<Dao[]>, error: any } => {
    const { data, error } = useSWR([snapshotApi.proposal_selectLatest], getFetcher, defaultSWRConfig)
    return { data, error }
}


export { defaultSWRConfig, getFetcher, useDaoListData as useSpaceListData, useDaoData as useSpaceData, useScoreData, useProposal, useLatestProposalData };
