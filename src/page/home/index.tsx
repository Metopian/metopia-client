import React, { useMemo, useState } from 'react'
import { BulletList } from 'react-content-loader'
import FlexibleOrderedContainer from '../../module/FlexibleOrderedContainer'
import { useSpaceListData, useLatestProposalData } from '../../governance'
import ClubCard from './ClubCard'
import './index.css'
import SearchInput from './SearchInput'
import { localRouter } from '../../config/urls'
import { useChainId } from '../../config/store'

const ProposalBoard = (props) => {
    const { data } = props
    const [index, setIndex] = useState(1)

    const next = () => setIndex(index === 5 ? 1 : index + 1)
    const last = () => setIndex(index === 1 ? 5 : index - 1)

    return <div>
        <div className="HomeHeadHotTopicsHead">
            <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/fire.svg" className='HomeHeadHotTopicsHeadIcon' alt="" />
            <div className="HomeHeadHotTopicsHeadTitle">Latest Proposals</div>
            <div className="HomeHeadHotTopicsHeadPager">
                <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/left_arrow.svg" alt="Last" onClick={last} />
                <div className="HomeHeadHotTopicsHeadPagerText">{index}/5</div>
                <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/right_arrow.svg" alt="Next" onClick={next} />
            </div>
        </div>
        <div className="HomeHeadHotTopicsContent" >
            <a href={data ? localRouter('proposal.prefix') + data.content[index - 1]?.id : '#'}>{data?.content[index - 1]?.title}</a>
        </div>
    </div>
}

const HomePage = (props) => {
    const { data: spaceData } = useSpaceListData()
    const { data: latestProposalData } = useLatestProposalData()
    const [keyword, setKeyword] = useState('')
    const {chainId} = useChainId()


    const spaceContainer = useMemo(() => {
        if (!spaceData?.content) {
            return <BulletList />
        }

        let spaceObjs = spaceData.content.map(s => {
            return {
                id: s.id,
                settings: JSON.parse(s.settings)
            }
        }).filter(s => {
            return parseInt(s.settings.network) === parseInt(chainId)
        }).filter(c => c.settings.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
        return <FlexibleOrderedContainer elementMinWidth={240} elementMaxWidth={330} gap={20} style={{ marginTop: '40px' }}>{
            spaceObjs.map(c =>
                <ClubCard key={"clubcard" + c.id} id={c.id} name={c.settings.name} coverUrl={c.settings.banner || c.settings.avatar || "/imgs/example_cover_large.png"}
                    avatar={c.settings.avatar}
                    slug={c.id}
                    joined={false} memberCount={0} />
            )
        }</FlexibleOrderedContainer>
    }, [spaceData, keyword, chainId])

    return <div className='HomePage'>
        <div className="HomeHead" style={{ backgroundImage: "url(/imgs/index_head_bg.png)" }}>
            <div className='HomeHeadContainer'>
                <div className="HomeHeadLeftContainer">
                    <div className="HomeHeadClubStats">
                        <span className="HomeHeadClubStatsNumber">{spaceData?.content && Object.keys(spaceData.content).length}</span>
                        DAOs
                    </div>
                    <div className="HomeHeadClubIntroduction">
                        The first Web3 infrastructure that powers NFT membership
                    </div>
                </div>
                <div className="HomeHeadRightContainer">
                    <ProposalBoard data={latestProposalData} />
                </div>
            </div>
        </div>
        <div className='HomeBody'>
            <div className='HomeBodyHead'>
                <span className='HomeBodyHeadTitle'>Metopolis list</span>
                <SearchInput onChange={setKeyword} />
            </div>
            {spaceContainer}
        </div>
    </div>
}

export default HomePage