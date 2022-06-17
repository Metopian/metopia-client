import parse from 'html-react-parser'
import React, { useEffect, useState } from 'react'
import { BulletList } from 'react-content-loader'
import { localRouter, snapshotApi } from '../../../config/urls'
import { GhostButtonGroup, MainButton } from '../../../module/button'
import { WrappedLazyLoadImage } from '../../../module/image'
import { addrShorten, capitalizeFirstLetter } from '../../../utils/stringUtils'
import './index.css'
import './ProposalCard.css'
import { DefaultAvatarWithRoundBackground } from '../../../module/image'

const ProposalCard = (props) => {
    return <div className="ProposalCard">
        <div className="ProposalCardHead">
            <div className="ProposalCardUserInfo">
                <DefaultAvatarWithRoundBackground wallet={props.author} className="ProposalCardUserAvatar"/>
                {/* <img src={props.avatar || "/imgs/face.svg"} alt={props.username} className="ProposalCardUserAvatar" /> */}
                <div className="ProposalCardUsername">{props.username}</div>
                <div className="ProposalCardAddr">{addrShorten(props.author)}</div>
            </div>
            <div className="ProposalCardState">
                <div className={"ProposalCardStateLeft " + (props.state.toLowerCase())}>{capitalizeFirstLetter(props.state)}</div>
                <div className="ProposalCardStateRight">{props.scores_total} Votes</div>
            </div>
        </div>
        <div className="ProposalCardBody">
            <div className="ProposalCardTitle"><a href={localRouter('proposal.prefix') + props.id}>{props.title}</a></div>
            <div className="ProposalCardContent">{parse(props.body)}</div>
        </div>
    </div>
}

const ClubHomePage = (props) => {
    const { slug } = props
    const [proposals, setProposals] = useState<any>([])
    const [spaceSettings, setSpaceSetting] = useState<any>({})
    const [proposalCount, setProposalCount] = useState(0)

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
    return <div className="ClubHomePage">
        <div className="ClubHomeContainer">
            <div className="ClubHomeHead">
                <WrappedLazyLoadImage src={spaceSettings.banner || '/imgs/example_cover_large.png'} className="ClubHomeCover" />
                <div className="ClubHomeCoverShadow"></div>
                <div className="ClubHomeMemberStats left">
                </div>
                <div className="ClubHomeMemberStats right">
                    <div className="ClubHomeMemberStatsNumber">{proposalCount}</div>
                    <div className="ClubHomeMemberStatsText">Proposals</div>
                </div>
            </div>
            <div className="ClubHomeIntroductionContainer">
                <div className='ClubHomeSymbolWrapper'>
                    <WrappedLazyLoadImage src={spaceSettings.avatar || '/imgs/defaultavatar.png'} className="ClubHomeSymbol" />
                </div>
                <div className="ClubHomeName">{spaceSettings.name} <img src="/imgs/write2.svg" alt="Edit" title="Edit settings" onClick={() => {
                    window.location.href = localRouter('club.update', { space: slug })
                }} /></div>
                <div className="ClubHomeIntroduction">{spaceSettings.about}</div>
            </div>
            <div className="ClubHomeFunctionContainer">
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
            <div className='ClubHomeContentContainer'>
                <div className='ClubHomeContentMenuContainer'>
                    <div className='ClubHomeContentMenuTitle'>Proposal</div>
                    <div className="ClubHomeContentMenu">All</div>
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