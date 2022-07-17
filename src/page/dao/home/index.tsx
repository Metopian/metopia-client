import parse from 'html-react-parser'
import React, { useEffect, useMemo, useState } from 'react'
import { BulletList } from 'react-content-loader'
import { loadSnapshotProposalsByDao } from '../../../config/graphql'
import { localRouter, snapshotApi } from '../../../config/urls'
import { useAccountListData } from '../../../core/account'
import { GhostButtonGroup, MainButton } from '../../../module/button'
import { DefaultAvatarWithRoundBackground, WrappedLazyLoadImage } from '../../../module/image'
import { sum } from '../../../utils/numberUtils'
import { addrShorten, capitalizeFirstLetter, compareIgnoringCase, unique } from '../../../utils/stringUtils'
import { getAddress } from '../../../utils/web3Utils'
import './index.scss'
import './ProposalCard.scss'

const ProposalCard = (props) => {
    const { account } = props

    const state = useMemo(() => {
        if (props.state.toLowerCase() === 'closed') {
            if (sum(props.scores) / 100 > 0 && sum(props.scores) >= props.quorum) {
                let maxId = -1, maxScore = 0
                props.scores.forEach((score, i) => {

                    if (score === maxScore) {
                        maxId = -1
                    } else if (score > maxScore) {
                        maxId = i
                        maxScore = score
                    }

                })
                if (maxId === -1)
                    return 'undecided'
                else if (props.choices[maxId].toLowerCase() === 'abstain' || props.choices[maxId].toLowerCase() === 'against') {
                    return 'against'
                } else
                    return props.choices[maxId].toLowerCase()
            } else {
                return 'invalid'
            }
        } else {
            return props.state.toLowerCase()
        }
    }, [props.state, props.quorum, props.choices, props.scores])
    
    return <div className="proposal-card">
        <div className="head">
            <div className="user-info" onClick={e => window.location.href = `${localRouter('profile')}${props.author}`}>
                {
                    account?.avatar ? <WrappedLazyLoadImage className="avatar" alt="" src={account.avatar} /> :
                        <DefaultAvatarWithRoundBackground wallet={props.author} className="avatar" />
                }
                {/* <img src={props.avatar || "/imgs/face.svg"} alt={props.username} className="ProposalCardUserAvatar" /> */}
                <div className="username">{account?.username || props.username}</div>
                <div className="address">{addrShorten(props.author)}</div>
            </div>
            <div className="state">
                <div className={"left-part " + state}>{capitalizeFirstLetter(state)}</div>
                <div className="right-part">{props.scores_total / 100} Votes</div>
            </div>
        </div>
        <div className="body">
            <div className="title"><a href={localRouter('proposal.prefix') + props.id}>{props.title}</a></div>
            <div className="content">{parse(props.body)}</div>
        </div>
    </div >
}

const DaoHomePage = (props) => {
    const { slug } = props
    const [proposals, setProposals] = useState<any>([])
    const [daoSettings, setDaoSetting] = useState<any>({})
    const [proposalCount, setProposalCount] = useState(0)
    const [self, setSelf] = useState(null)
    const { data: accounts } = useAccountListData(unique(proposals.map(p => p.author)))

    useEffect(() => {
        if (!self) {
            getAddress(true).then(addr => {
                if (addr?.length)
                    setSelf(addr)
            })
        }
    }, [self])

    useEffect(() => {
        if (!slug)
            return
        fetch(snapshotApi.graphql, {
            method: 'POST',
            body: JSON.stringify(loadSnapshotProposalsByDao(slug)),
            headers: {
                'content-type': "application/json"
            }
        }).then(d => d.json()).then(d => setProposals(d.data && d.data.proposals))

        fetch(snapshotApi.dao_selectById + "/?id=" + encodeURIComponent(slug)).then(d => {
            return d.json()
        }).then(d => {
            if (d.content && d.content.settings) {
                setDaoSetting(JSON.parse(d.content.settings))
                setProposalCount(d.content.proposalCount)
            }
        })

    }, [slug])

    const proposalCards = useMemo(() => {
        return proposals.map(p => <ProposalCard quorum={daoSettings?.voting?.quorum}{...p} key={'ProposalCard' + p.id} account={accounts?.data?.list?.find(acc => compareIgnoringCase(acc.owner, p.author))} />)
    }, [proposals, accounts, daoSettings])

    return <div className="dao-home-page">
        <div className="container">
            <div className="head">
                <WrappedLazyLoadImage src={daoSettings.banner || '/imgs/example_cover_large.png'} className="banner-image" />
                {/* <div className="cover-shadow"></div> */}
                <div className="stats left">
                </div>
                <div className="stats right">
                    <div className="number">{proposalCount}</div>
                    <div className="text">Proposals</div>
                </div>
            </div>
            <div className="introduction-container">
                <div className='symbol-wrapper'>
                    <WrappedLazyLoadImage src={daoSettings.avatar || '/imgs/defaultavatar.png'} className="symbol" />
                </div>
                <div className="name">
                    {daoSettings.name}
                    {
                        daoSettings?.admins?.includes(self) ? <img src="/imgs/write2.svg" alt="Edit" title="Edit settings" onClick={() => {
                            window.location.href = localRouter('dao.update', { dao: slug })
                        }} /> : null
                    }</div>
                <div className="introduction">{parse(daoSettings.about || '')}</div>
            </div>
            <div className="function-container">
                <MainButton solid style={{ width: '140px', height: '48px', margin: 0 }} onClick={() => {
                    window.location.href = localRouter('proposal.create', { dao: slug })
                }}>Propose</MainButton>
                <GhostButtonGroup items={
                    ['website', 'opensea', 'discord', 'twitter'].filter(key => daoSettings[key]).map(key => {
                        return {
                            content: <img src={`/imgs/${key}_purple.svg`} alt="Proposal" />,
                            onClick: () => window.location.href = daoSettings[key]
                        }
                    })} />
            </div>
            <div className='content-container'>
                <div className='sub-menu-bar'>
                    <div className='title'>Proposal</div>
                    <div className="sub-menu-item">All</div>
                </div>
                {
                    proposals ? (
                        proposals.length ? proposalCards :
                            <div style={{ color: '#888', fontSize: '20px', marginTop: '30px', marginBottom: '30px' }}>This DAO is empty.</div>) :
                        <BulletList />
                }
            </div>

        </div>
    </div>
}

// proposals.map(p => <ProposalCard {...p} key={'ProposalCard' + p.id} account={accounts?.data?.list?.filter(acc => compareIgnoringCase(acc.owner, p.author))} />)
export default DaoHomePage