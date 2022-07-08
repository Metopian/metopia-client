import parse from 'html-react-parser'
import React, { useEffect, useState } from 'react'
import { BulletList } from 'react-content-loader'
import { localRouter, snapshotApi } from '../../../config/urls'
import { GhostButtonGroup, MainButton } from '../../../module/button'
import { DefaultAvatarWithRoundBackground, WrappedLazyLoadImage } from '../../../module/image'
import { addrShorten, capitalizeFirstLetter } from '../../../utils/stringUtils'
import { getAddress } from '../../../utils/web3Utils'
import './index.scss'
import './ProposalCard.scss'

const ProposalCard = (props) => {
    return <div className="proposal-card">
        <div className="head">
            <div className="user-info">
                <DefaultAvatarWithRoundBackground wallet={props.author} className="avatar" />
                {/* <img src={props.avatar || "/imgs/face.svg"} alt={props.username} className="ProposalCardUserAvatar" /> */}
                <div className="username">{props.username}</div>
                <div className="address">{addrShorten(props.author)}</div>
            </div>
            <div className="state">
                <div className={"left-part " + (props.state.toLowerCase())}>{capitalizeFirstLetter(props.state)}</div>
                <div className="right-part">{props.scores_total} Votes</div>
            </div>
        </div>
        <div className="body">
            <div className="title"><a href={localRouter('proposal.prefix') + props.id}>{props.title}</a></div>
            <div className="content">{parse(props.body)}</div>
        </div>
    </div>
}

const ClubHomePage = (props) => {
    const { slug } = props
    const [proposals, setProposals] = useState<any>([])
    const [spaceSettings, setSpaceSetting] = useState<any>({})
    const [proposalCount, setProposalCount] = useState(0)
    const [self, setSelf] = useState(null)

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
        let request = {
            "operationName": "Proposals",
            "variables": {
                "first": 6,
                "skip": 0,
                "space": slug,
                "state": "all",
                "author_in": []
            },
            "query": "query Proposals($first: Int!, $skip: Int!, $state: String!, $space: String, $space_in: [String], $author_in: [String]) {\n  proposals(\n    first: $first\n    skip: $skip\n    where: {space: $space, state: $state, space_in: $space_in, author_in: $author_in}\n  ) {\n    id\n    ipfs\n    title\n    body\n    start\n    end\n    state\n    author\n    created\n    choices\n    space {\n      id\n      name\n      members\n      avatar\n      symbol\n    }\n    scores_state\n    scores_total\n    scores\n    votes\n  }\n}"
        }
        fetch(snapshotApi.graphql, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                'content-type': "application/json"
            }
        }).then(d => d.json()).then(d => setProposals(d.data && d.data.proposals))

        fetch(snapshotApi.dao_selectById + "/?id=" + encodeURIComponent(slug), {

        }).then(d => {
            return d.json()
        }).then(d => {
            if (d.content && d.content.settings) {
                setSpaceSetting(JSON.parse(d.content.settings))
                setProposalCount(d.content.proposalCount)
            }
        })

    }, [slug])

    return <div className="club-home-page">
        <div className="container">
            <div className="head">
                <WrappedLazyLoadImage src={spaceSettings.banner || '/imgs/example_cover_large.png'} className="cover-image" />
                <div className="cover-shadow"></div>
                <div className="stats left">
                </div>
                <div className="stats right">
                    <div className="number">{proposalCount}</div>
                    <div className="text">Proposals</div>
                </div>
            </div>
            <div className="introduction-container">
                <div className='symbol-wrapper'>
                    <WrappedLazyLoadImage src={spaceSettings.avatar || '/imgs/defaultavatar.png'} className="symbol" />
                </div>


                <div className="name">
                    {spaceSettings.name}
                    {
                        spaceSettings?.admins?.includes(self) ? <img src="/imgs/write2.svg" alt="Edit" title="Edit settings" onClick={() => {
                            window.location.href = localRouter('club.update', { space: slug })
                        }} /> : null
                    }</div>
                <div className="introduction">{parse(spaceSettings.about||'')}</div>
            </div>
            <div className="function-container">
                <MainButton solid style={{ width: '140px', height: '48px', margin: 0 }} onClick={() => {
                    window.location.href = localRouter('proposal.create', { space: slug })
                }}>Propose</MainButton>
                <GhostButtonGroup items={
                    ['website', 'opensea', 'discord', 'twitter'].filter(key => spaceSettings[key]).map(key => {
                        return {
                            content: <img src={`/imgs/${key}_purple.svg`} alt="Proposal" />,
                            onClick: () => window.location.href = spaceSettings[key]
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
                        proposals.length ?
                            proposals.map(p => <ProposalCard {...p} key={'ProposalCard' + p.id} />) :
                            <div style={{ color: '#888', fontSize: '20px', marginTop: '30px', marginBottom: '30px' }}>This space is empty.</div>) :
                        <BulletList />
                }
            </div>

        </div>
    </div>
}

export default ClubHomePage