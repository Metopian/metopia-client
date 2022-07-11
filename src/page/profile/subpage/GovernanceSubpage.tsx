import React, { useMemo } from 'react'
import { BulletList } from 'react-content-loader'
import useSWR from 'swr'
import { loadSnapshotHistory } from '../../../config/graphql'
import { nftDataApi } from '../../../config/urls'
import { customFormat } from '../../../utils/TimeUtil'
import ProfileTable from '../module/ProfileTable'
import './GovernanceSubpage.scss'

const nftServiceFetcher = (owner) => fetch(nftDataApi.goverance_selectByOwner + "?owner=" + owner).then((res) => res.json())

const useGovernanceData = (address) => {
    const { data, error } = useSWR([address], nftServiceFetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}

const snapshotFetcher = (address) => {
    return fetch("https://hub.snapshot.org/graphql?", {
        body: JSON.stringify(loadSnapshotHistory(address)),
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((res) => res.json())
}

const useSnapshotData = (address, flag) => {
    const { data, error } = useSWR([address, flag], snapshotFetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}
const GovernanceSubpage = (props) => {
    const { slug } = props
    const { data: governanceData } = useGovernanceData(slug)
    const { data: snapshotData } = useSnapshotData(slug, true)

    const snapshotTable = useMemo(() => {
        if (snapshotData?.data?.votes?.length)
            return <ProfileTable data={snapshotData.data.votes.map(d => {
                return [d.space.name, d.proposal.title, customFormat(new Date(d.created * 1000), '#YYYY#-#MM#-#DD#')]
            })} heads={['Space', 'Title', 'Date']} onSelect={(i) => {
                window.open('https://snapshot.org/#/' + snapshotData.data.votes[i].space.id + "/proposal/" + snapshotData.data.votes[i].proposal.id)
            }} />
    }, [snapshotData])

    return <div className="GovernanceSubpage">
        {
            snapshotData?.data && governanceData?.data ? <div>
                <div className="GovernanceSubpageGroup">
                    <div className="label">Multisig Signers:</div>
                    <div>{governanceData.data.multisig_transactions_count > 0 ? "True" : "False"}</div>
                </div>
                <div className="GovernanceSubpageGroup" style={{ display: 'block' }}>
                    <div className="label" style={{ marginBottom: '12px', marginTop: '32px', }}>Snapshot vote hitory:</div>
                    {
                        snapshotTable
                    }
                    {/* <div>{data.data.multisig_transactions_count > 0 ? "True" : "False"}</div> */}
                </div>
            </div> : <div style={{ marginTop: '20px' }}>
                <BulletList style={{ height: '200px' }} />
                {/* <ReactLoading height={21} width={40} color='#333' /> */}
            </div>
        }
    </div>

}

export default GovernanceSubpage