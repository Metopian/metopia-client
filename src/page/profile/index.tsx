import React, { useEffect, useMemo, useState } from "react";
import { useChainId } from '../../config/store';
import { localRouter } from "../../config/urls";
import { DefaultAvatar } from '../../module/image';
import { useNfts } from '../../third-party/moralis';
import { encodeQueryData } from '../../utils/RestUtils';
import { getAddress, getEns } from '../../utils/web3Utils';
import './index.scss';
import DiscordSubPage from './subpage/DiscordSubPage';
import DonationSubpage from "./subpage/DonationSubpage";
import FungiblesSubpage from './subpage/FungiblesSubpage';
import GovernanceSubpage from './subpage/GovernanceSubpage';
import NFTSubpage from './subpage/NFTSubpage';
import NftTransactionSubpage from "./subpage/NftTransactionSubpage";
import PoapSubpage from "./subpage/PoapSubpage";

const ProfilePage = (props) => {
    const { slug, subpage, state, code } = props
    const { chainId } = useChainId()
    const { data: nfts } = useNfts(slug, chainId)
    const [ens, setEns] = useState(null)
    const nftCount = useMemo(() => {
        if (!nfts)
            return 'NaN'
        else
            return nfts.total
    }, [nfts])

    useEffect(() => {
        if (slug?.length) {
            (async () => {
                const ens = await getEns(slug)
                if (ens?.length)
                    setEns(ens)
            })()
        }
    }, [slug])

    useEffect(() => {
        if (!slug) {
            getAddress().then(addr => window.location.href = encodeQueryData(localRouter('profile') + addr, { subpage, state, code })).catch(e => {
                window.location.href = localRouter('home')
            })
        }
    }, [slug, subpage, state, code])

    const { subpageJsx, subpageIndex } = useMemo(() => {
        let tmpJsx = <NFTSubpage slug={slug} />,
            tmpIndex = 0
        if (subpage === -1) {
            tmpJsx = <FungiblesSubpage slug={slug} />
            tmpIndex = -1
        } else if (subpage === 'donations') {
            tmpJsx = <DonationSubpage slug={slug} />
            tmpIndex = 2
        } else if (subpage === 'poap') {
            tmpJsx = <PoapSubpage slug={slug} />
            tmpIndex = 3
        } else if (subpage === 4) {
            tmpJsx = <NftTransactionSubpage slug={slug} />
            tmpIndex = -1
        } else if (subpage === 'governance') {
            tmpJsx = <GovernanceSubpage slug={slug} />
            tmpIndex = 5
        } else if (subpage === 'discord') {
            tmpJsx = <DiscordSubPage slug={slug} state={state} code={code} />
            tmpIndex = 6
        }
        return { subpageJsx: tmpJsx, subpageIndex: tmpIndex }
    }, [slug, subpage])

    return <div className="profile-page">
        <div className="container">
            <div className="head" style={{ backgroundImage: 'url(/imgs/profile_page_head_bg.png)' }}>
                <div className="container">
                    <div className='avatar-wrapper'>
                        <DefaultAvatar wallet={slug} className="avatar" />
                    </div>
                    <div className="name">
                        {ens || slug}
                    </div>
                    <div className="stats-wrapper">
                        <div className="group">
                            <div className="number">
                                {nftCount}
                            </div>
                            <div className="text">
                                NFTs
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="body">
                <div className="main-title">
                    <div className="sub-menu-bar">
                        <div className={"sub-menu-item" + (subpageIndex === 0 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'nft' })}>NFT</div>
                        {/* <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 1 ? ' selected' : '')} onClick={() => setSelectedTabIndex(1)}>Fungibles</div> */}
                        <div className={"sub-menu-item" + (subpageIndex === 2 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'donations' })}>Donation</div>
                        <div className={"sub-menu-item" + (subpageIndex === 3 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'poap' })}>Poap</div>
                        <div className={"sub-menu-item" + (subpageIndex === 5 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'governance' })}>Governance</div>
                        {/* <div className={"sub-menu-item" + (subpageIndex === 6 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'discord' })}>Discord</div> */}
                        {/* <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 4 ? ' selected' : '')} onClick={() => setSelectedTabIndex(4)}>Governance</div> */}
                        {/* <div style={{ marginLeft: 'auto' }}><MainButton onClick={() => {
                            window.localStorage?.removeItem('user')
                            logout()
                            window.location.href = localRouter('home')
                        }}>Log out</MainButton></div> */}
                    </div>
                </div>
                <div className="content-container">
                    {subpageJsx}
                </div>
            </div>
        </div>

    </div>
}

export default ProfilePage