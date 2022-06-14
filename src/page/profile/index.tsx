import { ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from "react";
import { logout } from '../../config/redux/userSlice';
import { localRouter } from "../../config/urls";
import { MainButton } from '../../module/button';
import { useNfts } from '../../third-party/moralis';
import { getAddress } from '../../utils/web3Utils';
import './index.css';
import DonationSubpage from "./subpage/DonationSubpage";
import FungiblesSubpage from './subpage/FungiblesSubpage';
import GovernanceSubpage from './subpage/GovernanceSubpage';
import NFTSubpage from './subpage/NFTSubpage';
import NftTransactionSubpage from "./subpage/NftTransactionSubpage";
import PoapSubpage from "./subpage/PoapSubpage";
import { DefaultAvatar } from '../../module/image';

const ProfilePage = (props) => {
    const { slug } = props
    const { data: ethNfts, error: ethError } = useNfts(slug, '0x1')
    const [ens, setEns] = useState(null)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)

    const nftCount = useMemo(() => {
        if (!ethNfts)
            return 'NaN'
        else
            return ethNfts.total
    }, [ethNfts])

    useEffect(() => {
        let provider = ethers.getDefaultProvider();
        provider.lookupAddress(slug).then(e => setEns(e)).catch(e => {
            console.error(e)
        })
    }, [slug])

    useEffect(() => {
        if (!slug) {
            getAddress().then(addr => window.location.href = localRouter('profile') + addr).catch(e => {
                window.location.href = localRouter('home')
            })
        }
    }, [slug])
    const subpage = useMemo(() => {
        if (selectedTabIndex === 0) {
            return <NFTSubpage slug={slug} />
        } else if (selectedTabIndex === 1) {
            return <FungiblesSubpage slug={slug} />
        } else if (selectedTabIndex === 2) {
            return <DonationSubpage slug={slug} />
        } else if (selectedTabIndex === 3) {
            return <PoapSubpage slug={slug} />
        } else if (selectedTabIndex === 4) {
            return <NftTransactionSubpage slug={slug} />
        } else if (selectedTabIndex === 5) {
            return <GovernanceSubpage slug={slug} />
        }
    }, [slug, selectedTabIndex])

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
                        <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 0 ? ' selected' : '')} onClick={() => setSelectedTabIndex(0)}>NFTs</div>
                        {/* <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 1 ? ' selected' : '')} onClick={() => setSelectedTabIndex(1)}>Fungibles</div> */}
                        <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 2 ? ' selected' : '')} onClick={() => setSelectedTabIndex(2)}>Donations</div>
                        <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 3 ? ' selected' : '')} onClick={() => setSelectedTabIndex(3)}>Mementos</div>
                        <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 5 ? ' selected' : '')} onClick={() => setSelectedTabIndex(5)}>Governance</div>
                        {/* <div className={"ProfilePageMainTitleMenuItem" + (selectedTabIndex === 4 ? ' selected' : '')} onClick={() => setSelectedTabIndex(4)}>Governance</div> */}
                        {/* <div style={{ marginLeft: 'auto' }}><MainButton onClick={() => {
                            window.localStorage?.removeItem('user')
                            logout()
                            window.location.href = localRouter('home')
                        }}>Log out</MainButton></div> */}
                    </div>
                </div>
                <div className="ProfilePageContentWrapper">
                    {subpage}
                </div>
            </div>
        </div>

    </div>
}

export default ProfilePage