import React, { useMemo, useState } from 'react'
import { BulletList } from 'react-content-loader'
import FlexibleOrderedContainer from '../../module/FlexibleOrderedContainer'
import { useDaoListData, useLatestProposalData } from '../../governance'
import DaoCard from './DaoCard'
import './index.scss'
import SearchInput from './SearchInput'
import { localRouter } from '../../config/urls'
import { useChainId } from '../../config/store'
import { WrappedLazyLoadImage } from '../../module/image'

const ProposalBoard = (props) => {
    const { data } = props
    const [index, setIndex] = useState(1)

    const next = () => setIndex(index === 5 ? 1 : index + 1)
    const last = () => setIndex(index === 1 ? 5 : index - 1)

    return <div className="proposal-board">
        <div className="head">
            <div className="title">Latest Proposals</div>
            <div className="dao-info">
                <WrappedLazyLoadImage src={data?.content[index - 1]?.spaceAvatar} className="avatar-wrapper" />
                <div className='name'>{data?.content[index - 1]?.spaceName}</div>
                <div>&gt;</div>
            </div>
        </div>
        <div className="content" >
            <a href={data ? localRouter('proposal.prefix') + data.content[index - 1]?.id : '#'}>{data?.content[index - 1]?.title}</a>
        </div>
        <div className="pager">
            <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/left_arrow.svg" alt="Last" onClick={last} />
            <div className="text">{index}<div className='slash'>/</div>5</div>
            <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/right_arrow.svg" alt="Next" onClick={next} />
        </div>
    </div>
}

const HomePage = () => {
    const { data: daoData } = useDaoListData()
    const { data: latestProposalData } = useLatestProposalData()
    const [keyword, setKeyword] = useState('')
    const { chainId } = useChainId()

    const daoContainer = useMemo(() => {
        if (!daoData?.content) {
            return <BulletList />
        }

        let daoObjs = daoData.content.map(s => {
            return {
                id: s.id,
                settings: JSON.parse(s.settings)
            }
        }).filter(s => {
            return parseInt(s.settings.network) === parseInt(chainId)
        }).filter(c => c.settings.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
        return <FlexibleOrderedContainer elementMinWidth={240} elementMaxWidth={330} gap={20} style={{ marginTop: '40px' }}>{
            daoObjs.map(c =>
                <DaoCard key={"dao-card" + c.id} id={c.id} name={c.settings.name} coverUrl={c.settings.banner || c.settings.avatar || "/imgs/example_cover_large.png"}
                    avatar={c.settings.avatar}
                    slug={c.id}
                    joined={false} memberCount={0} />
            )
        }</FlexibleOrderedContainer>
    }, [daoData, keyword, chainId])

    return <div className='home-page'>
        <div className="head" style={{ backgroundImage: "url(/imgs/index_head_bg.png)" }}>
            <div className='container'>
                <div className="left-container">
                    <div className="stats">
                        <span className="number">{daoData?.content && Object.keys(daoData.content).length}</span>
                        DAOs
                    </div>
                    <div className="introduction">
                        The first Web3 infrastructure that powers NFT membership
                    </div>
                </div>
                <div className="right-container">
                    <ProposalBoard data={latestProposalData} />
                </div>
            </div>
        </div>
        <div className='body'>
            <div className='head'>
                <span className='title'>DAOs</span>
                <SearchInput onChange={setKeyword} />
            </div>
            {daoContainer}
        </div>
    </div>
}

export default HomePage