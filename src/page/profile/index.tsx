import { ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from "react";
import { chainId } from '../../config/constant';
import { localRouter } from "../../config/urls";
import { DefaultAvatar } from '../../module/image';
import { useNfts } from '../../third-party/moralis';
import { encodeQueryData } from '../../utils/RestUtils';
import { getAddress } from '../../utils/web3Utils';
import './index.css';
import DiscordSubPage from './subpage/DiscordSubPage';
import DonationSubpage from "./subpage/DonationSubpage";
import FungiblesSubpage from './subpage/FungiblesSubpage';
import GovernanceSubpage from './subpage/GovernanceSubpage';
import NFTSubpage from './subpage/NFTSubpage';
import NftTransactionSubpage from "./subpage/NftTransactionSubpage";
import PoapSubpage from "./subpage/PoapSubpage";

const ProfilePage = (props) => {
    const { slug, subpage, state, code } = props
    const { data: nfts, error: ethError } = useNfts(slug, chainId)
    const [ens, setEns] = useState(null)
    const nftCount = useMemo(() => {
        if (!nfts)
            return 'NaN'
        else
            return nfts.total
    }, [nfts])

    useEffect(() => {
        let provider = ethers.getDefaultProvider();
        provider.lookupAddress(slug).then(e => setEns(e)).catch(e => {
            console.error(e)
        })
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
        } else if (subpage === 'momentos') {
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
    
    return <div className="ProfilePage">
        <div className="ProfilePageContainer">
            <div className="ProfilePageHead" style={{ backgroundImage: 'url(/imgs/profile_page_head_bg.png)' }}>
                <div className="ProfilePageHeadContainer">
                    <div className='ProfilePageHeadAvatarWrapper'>
                        <DefaultAvatar wallet={slug} className="ProfilePageHeadAvatar" />
                    </div>
                    {/* <img src={'/imgs/face.svg'} className="ProfilePageHeadAvatar" alt="" /> */}
                    <div className="ProfilePageHeadName">
                        {ens || slug}
                    </div>
                    <div className="ProfilePageHeadStats">
                        <div className="ProfilePageHeadStatsGroup">
                            <div className="ProfilePageHeadStatsNumber">
                                {nftCount}
                            </div>
                            <div className="ProfilePageHeadStatsText">
                                NFTs
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ProfilePageMainContainer">
                <div className="ProfilePageMainTitle">
                    <div className="ProfilePageMainTitleMenu">
                        <div className={"ProfilePageMainTitleMenuItem" + (subpageIndex === 0 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'nft' })}>NFTs</div>
                        {/* <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 1 ? ' selected' : '')} onClick={() => setSelectedTabIndex(1)}>Fungibles</div> */}
                        <div className={"ProfilePageMainTitleMenuItem" + (subpageIndex === 2 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'donations' })}>Donations</div>
                        <div className={"ProfilePageMainTitleMenuItem" + (subpageIndex === 3 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'momentos' })}>Mementos</div>
                        <div className={"ProfilePageMainTitleMenuItem" + (subpageIndex === 5 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'governance' })}>Governance</div>
                        <div className={"ProfilePageMainTitleMenuItem" + (subpageIndex === 6 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'discord' })}>Discord</div>
                        {/* <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 4 ? ' selected' : '')} onClick={() => setSelectedTabIndex(4)}>Governance</div> */}
                        {/* <div style={{ marginLeft: 'auto' }}><MainButton onClick={() => {
                            window.localStorage?.removeItem('user')
                            logout()
                            window.location.href = localRouter('home')
                        }}>Log out</MainButton></div> */}
                    </div>
                </div>
                <div className="ProfilePageContentWrapper">
                    {subpageJsx}
                </div>
            </div>
        </div>

    </div>
}

export default ProfilePage