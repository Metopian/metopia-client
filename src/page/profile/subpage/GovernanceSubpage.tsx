import React, { useMemo } from 'react'
import './GovernanceSubpage.css'
import { nftDataApi } from '../../../config/urls'
import useSWR from 'swr'
// import ReactLoading from 'react-loading'
import Metable from '../module/ProfileTable'
import { BulletList } from 'react-content-loader'

const formatDate = function (date, fmt) { //author: meizz 
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

const nftServiceFetcher = (owner) => fetch(nftDataApi.goverance_selectByOwner + "?owner=" + owner).then((res) => res.json())

const useGovernanceData = (address) => {
    const { data, error } = useSWR([address], nftServiceFetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}

const snapshotFetcher = (address) => {
    let param = {
        operationName: "Votes",
        query: 'query Votes {   votes (     first: 1000     where: {       voter: "' +
            address +
            '"     }   ) {     id     voter     created     choice     proposal {     id  title       choices     }     space {       id       name            	avatar     }   } }',
        variables: null
    }
    return fetch("https://hub.snapshot.org/graphql?", {
        body: JSON.stringify(param),
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
            return <Metable data={snapshotData.data.votes.map(d => {
                return [d.space.name, d.proposal.title, formatDate(new Date(d.created * 1000), 'yyyy-MM-dd')]
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