import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChainId } from '../../config/store';
import { localRouter } from "../../config/urls";
import { MainButton } from "../../module/button";
import { DefaultAvatar, WrappedLazyLoadImage } from '../../module/image';
import { usePersonalDiscordData } from "../../third-party/discord";
import { useNfts } from '../../third-party/moralis';
import { uploadFileToIfps } from "../../utils/ipfsUtils";
import { encodeQueryData } from '../../utils/RestUtils';
import { compareIgnoringCase } from "../../utils/stringUtils";
import { getAddress, getEns } from '../../utils/web3Utils';
import { useAccountData, updateAccount } from "./function";
import './index.scss';
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
    const { data: discordData } = usePersonalDiscordData(slug, code)

    const { data: accountData } = useAccountData(slug)

    const [ens, setEns] = useState(null)
    const [self, setSelf] = useState(null)
    const [avatar, setAvatar] = useState(null)

    const avatarInputRef = useRef(null)

    console.log(accountData)

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
        getAddress().then(addr => setSelf(addr)).catch(e => {
            window.location.href = localRouter('home')
        })
    }, [])

    useEffect(() => {
        if (!slug) {
            getAddress().then(addr => window.location.href = encodeQueryData(localRouter('profile') + addr, { subpage, state, code })).catch(e => {
                window.location.href = localRouter('home')
            })
        }
    }, [slug, subpage, state, code])

    const updateUser = useCallback(params => {
        if (accountData?.data) {
            const tmp = Object.assign({}, accountData.data, params)
            updateAccount(tmp.owner, tmp.username, tmp.avatar, tmp.introduction)
        }
    }, [accountData])

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
        }
        return { subpageJsx: tmpJsx, subpageIndex: tmpIndex }
    }, [slug, subpage])
    console.log((avatar && window.URL.createObjectURL(avatar)) || accountData?.data?.avatar)
    return <div className="profile-page">
        <div className="container">
            <div className="head" style={{ backgroundImage: 'url(/imgs/profile_page_head_bg.png)' }}>
                <div className="container">
                    <div className={'avatar-wrapper' + (compareIgnoringCase(self, slug) ? " editable" : '')} onClick={e => {
                        compareIgnoringCase(self, slug) &&
                            avatarInputRef.current.click()
                    }}>
                        {
                            (accountData?.data?.avatar || avatar) ?
                                <WrappedLazyLoadImage src={(avatar && window.URL.createObjectURL(avatar)) || accountData?.data?.avatar} alt="" /> :
                                <DefaultAvatar wallet={slug} className="avatar default" />
                        }
                        <input className="Hidden" type='file' ref={avatarInputRef} onChange={async (e) => {
                            if (!e.target.files[0])
                                return
                            let result = await uploadFileToIfps(e.target.files[0])
                            if (!result.IpfsHash) {
                                window.alert("Image upload failed. Please check your network.")
                                return
                            }
                            updateUser({ avatar: "ipfs://" + result.IpfsHash })
                            setAvatar(e.target.files[0])
                        }} />
                    </div>
                    <div className="basic-profile">
                        <div className="name-wrapper">
                            <div className="name">{ens || slug}</div>
                            <img src="/imgs/discord-verified.svg" alt="Verified" title={'Verified'} />
                            {/* <GhostButtonGroup items={
                                ['twitter'].map(key => {
                                    return {
                                        content: <img src={`/imgs/${key}_purple.svg`} alt="Proposal" />,
                                        onClick: () => window.location.href = spaceSettings[key]
                                    }
                                })} /> */}
                        </div>
                        {
                            discordData?.data?.redirect_uri ? <MainButton onClick={e => {
                                window.open(discordData?.data?.redirect_uri)
                            }}>Connect to Discord</MainButton> : null
                        }
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
                        <div className={"sub-menu-item" + (subpageIndex === 2 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'donations' })}>Donation</div>
                        <div className={"sub-menu-item" + (subpageIndex === 3 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'poap' })}>Poap</div>
                        <div className={"sub-menu-item" + (subpageIndex === 5 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'governance' })}>Governance</div>
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