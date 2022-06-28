import React, { useMemo } from 'react'
import useSWR from 'swr'
import { nftDataApi } from '../../../config/urls'
import './GovernanceSubpage.scss'
import { BulletList } from 'react-content-loader'
import Metable from '../module/ProfileTable'
import { customFormat } from '../../../utils/TimeUtil'
import Markdown from 'markdown-to-jsx';
import { WrappedLazyLoadImage } from '../../../module/image'

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
        query: 'query Votes { votes ( first: 1000 where: { voter: "' +
            address +
            '" } ) { id voter created choice proposal { id title body choices } space { id name avatar } } }',
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

const GovernanceCardLayout = (props) => {
    return <div className='governance-card-layout'>
        <div className='left-container'>
            {
                props.children.map((item, i) => {
                    if (i % 2 === 0)
                        return item
                })
            }
        </div>
        <div className='right-container'>
            {
                props.children.map((item, i) => {
                    if (i % 2 === 1)
                        return item
                })
            }
        </div>
    </div>
}

const GovernanceSubpage = (props) => {
    const { slug } = props
    const { data: snapshotData } = useSnapshotData(slug, true)

    return <div className="GovernanceSubpage">
        {
            snapshotData?.data ? (snapshotData.data.votes?.length ? <div>
                <div>
                    <GovernanceCardLayout >
                        {
                            snapshotData.data.votes.map((d, i) => {
                                return <div className="snapshot-card" key={'snapshot-card-' + i}>
                                    <div className="head">
                                        <a href={'https://snapshot.org/#/' + snapshotData.data.votes[i].space.id}>
                                            <WrappedLazyLoadImage src={d.space.avatar} />
                                            <div className="name">{d.space.name}</div>
                                        </a >
                                    </div>
                                    <div className='container'>
                                        <div className="time-wrapper">
                                            <img src="/imgs/clock.svg" alt="" />
                                            <div className="time">{customFormat(new Date(d.created * 1000), '#YYYY#-#MM#-#DD#')}</div>
                                        </div>
                                        <div className="title"><a href={'https://snapshot.org/#/' + snapshotData.data.votes[i].space.id + "/proposal/" + snapshotData.data.votes[i].proposal.id}>{d.proposal.title}</a></div>
                                        <Markdown className="body">{d.proposal.body}</Markdown>
                                        <div className='voted-wrapper'>Voted: {d.proposal.choices[d.choice - 1]}</div>
                                    </div>
                                </div>
                            })
                        }
                    </GovernanceCardLayout>
                </div>
            </div> : <div style={{ marginTop: '20px' }} className='no-content-container'>
                You have not attended any Snapshot activities.
            </div>) : <div style={{ marginTop: '20px' }} className='no-content-container'>
                <BulletList style={{ height: '200px' }} />
            </div>
        }
    </div>

}

export default GovernanceSubpage