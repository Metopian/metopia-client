
import useSWR from "swr";
import { loadSnapshotProposalsByDao, loadSnapshotProposalsById } from "../config/graphql";
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

const useDaoListData = (): { data: Dao[], error: any } => {
    const { data, error } = useSWR([snapshotApi.dao_select], getFetcher, defaultSWRConfig)
    return { data: data?.code === 200 ? data?.content : null, error: error || (data?.code !== 200 && data?.content) }
}
const useDaoById = (id: string): { data: Dao, error: any } => {
    const { data, error } = useSWR(id ? [snapshotApi.dao_selectById, { id: id }] : null, getFetcher, defaultSWRConfig)
    return { data: data?.code === 200 ? data?.content : null, error: error || (data?.code !== 200 && data?.content) }
}

const useScoreData = (dao: string, network: string, snapshot: number, strategies: string, addresses?: string[]): { data: any[], error: any } => {
    let scoreParam = { "params": { space: dao, network, snapshot, strategies, addresses } }
    const { data, error } = useSWR(dao && addresses?.length && strategies && snapshot ? [snapshotApi.score, scoreParam] : null, postFetcher, defaultSWRConfig)
    return { data: data?.result?.scores, error }
}

export const useProposalDataByDao = (slug, first?, skip?, onChange?): { data: any[], error: any } => {
    const { data, error } = useSWR([snapshotApi.graphql, loadSnapshotProposalsByDao(slug, first, skip), onChange], postFetcher, defaultSWRConfig)
    return { data: data?.data?.proposals, error }
}


const useProposalById = (id) => {
    const { data, error } = useSWR(id && [snapshotApi.graphql, loadSnapshotProposalsById(id)], postFetcher, defaultSWRConfig)
    return { data: data?.data?.proposal, error }
}

const useLatestProposalData = (): { data: any[], error: any } => {
    const { data, error } = useSWR([snapshotApi.proposal_selectLatest], getFetcher, defaultSWRConfig)
    return { data: data?.code === 200 ? data?.content : null, error: error || (data?.code !== 200 && data?.content) }
}


export { useDaoListData, useDaoById, useScoreData, useProposalById, useLatestProposalData };

