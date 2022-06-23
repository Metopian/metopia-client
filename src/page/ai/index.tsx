import $ from 'jquery';
import React, { useEffect, useMemo, useState } from 'react';
import ReactLoading from 'react-loading';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { generateAiImage, getWhiteListAddress, mint, verifyWhitelist, wl_mint } from '../../ai';
import useAiResult from '../../ai/useAiResult';
import { aiErrors, chainExplorerMap, chainMap } from '../../config/constant';
import { logout } from '../../config/redux/userSlice';
import type { RootState } from '../../config/store';
import { type MoralisNft } from '../../config/type/moralisType';
import type { Signature } from '../../config/type/web3Type';
import { MainButton } from '../../module/button';
import { useLoginModal } from '../../module/LoginModal';
import { LogoIcon, MenuItem } from '../../module/Menu';
import { NftCollectionNameButton, NftOptionCard } from '../../module/nft';
import { resyncToken, useNfts } from '../../third-party/moralis';
import { getNFTReadableSrc, getSortedNfts, nftFind } from '../../utils/NftUtils';
import { addrShorten } from '../../utils/stringUtils';
import { switchChain } from '../../utils/web3Utils';
import './index.css';

interface NftGroup {
    name: string;
    tokenAddress: string;
    chainId: string;
    data: MoralisNft[];
}

const Label = (props) => {
    return <div className={'AIActLabel ' + (props.className ? props.className : "")}
        style={props.style}  >{props.children}</div>
}

const whitelistModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: "center"
    }, container: {
    },
    content: {
        // top: '34.8vw',
        // left: '56vw',
        width: '400px',
        height: '160px',
        padding: 0, position: 'relative',
        backgroundColor: '#00000000',
        border: 'none'
    }
}

const aiMenuConfig = [
    // {
    //     id: 'user',
    //     icon: 'https://metopia.oss-cn-hongkong.aliyuncs.com/profile.svg',
    //     name: 'Profile',
    //     link: localRouter('ai'),
    //     isIcon: false
    // }, 
    {
        id: 'doc',
        icon: 'https://metopia.oss-cn-hongkong.aliyuncs.com/books-fill.svg',
        name: 'Doc',
        link: "https://metopia.gitbook.io/metopia-docs/metobot/metobot",
    },
]

const AIActPage = () => {
    const [showInput, setShowInput] = useState(false)
    const [showActivateButton, setShowActivateButton] = useState(false)
    const [selectedNfts, setSelectedNfts] = useState([])
    const [verifying, setVerifying] = useState(false)

    // const [queriedTokenInfo, setQueriedTokenInfo] = useState([])
    const [sendingRequest, setSendingRequest] = useState(false)
    const [minting, setMinting] = useState(false)
    const [querying, setQuerying] = useState(false)
    const [signature, setSignature] = useState<Signature | null>()
    const [selectedContracts, setSelectedContracts] = useState([])

    // const [nftBalance, setNftBalance] = useState(1)
    const [syncing, setSyncing] = useState(false)
    const [metoNfts, setMetoNfts] = useState([])

    const { display: showLoginModal } = useLoginModal()
    const user = useSelector((state: RootState) => state.user)
    const { data: ethNfts, error: ethError } = useNfts(null, '0x1')
    const { data: maticNfts, error: maticError } = useNfts(null, '0x89')
    const { data: rinkebyNfts, error: rinkebyError } = useNfts(null, '0x4')
    const { data: aiResult, error: aiError } = useAiResult()
    const [generatingImages, setGeneratingImages] = useState([])
    // 0: generate; 1. mint
    const [step, setStep] = useState(0)
    const [mintingImage, setMintingImage] = useState(null)
    const [mintedImages, setMintedImages] = useState(null)
    const dispatch = useDispatch()
    useEffect(() => {
        document.title = 'Metobot - AI Powered Skinwear tools developed by Metopia'
        $('.MenuWrapper').css('display', 'none')
        $('.AppContainer').css('width', '100%')

        if (!user.wallet || !user.wallet.account) {
            // showLoginModal(1)
        }
        if (window.localStorage) {
            let tmp = window.localStorage.getItem("generatingImages")
            if (tmp) {
                setGeneratingImages(JSON.parse(tmp))
            }
            let tmp2 = window.localStorage.getItem("mintedImages")
            if (tmp2) {
                setMintedImages(JSON.parse(tmp2))
            }
        }
        // if (window.ethereum && !window.ethereum._state.initialized) {
        //     alert('Please refresh the application to get your MetaMask ready.')
        //     return
        //   }
    }, [])

    // useEffect(() => {
    //     if (rinkebyNfts) {
    //         let metoNftsListRaw = rinkebyNfts.result.filter(nft => nft.token_address.toLowerCase() === '0x4F717b9BB13C45608b2e37a255Da8C1186aCbaab'.toLowerCase())
    //         setMetoNfts(metoNftsListRaw)
    //     }
    // }, [rinkebyNfts])

    useEffect(() => {
        if (maticNfts) {
            let metoNftsListRaw = maticNfts.result.filter(nft => nft.token_address.toLowerCase() === '0xf91a8c71A5b73b1cB09f43972a5B79Eb0D7B32AD'.toLowerCase())
            setMetoNfts(metoNftsListRaw)
        }
    }, [maticNfts])

    const sortedNfts = useMemo(() => {
        if (!ethNfts && !maticNfts)
            return []
        let nftList: MoralisNft[] = []
        if (ethNfts && ethNfts.result)
            nftList.push(...(ethNfts.result.filter(item => item.metadata).map(item => {
                return Object.assign({}, item, { chainId: '0x1' })
            })))
        if (maticNfts && maticNfts.result)
            nftList.push(...(maticNfts.result.filter(item => item.metadata).map(item => {
                return Object.assign({}, item, { chainId: '0x89' })
            })))
        if (user.wallet && user.wallet.account && user.wallet.account.toLowerCase() === '0xE5058B16b84afE3db3Cd0A87bC46cB7B7169246b'.toLowerCase()) {
            nftList.push({
                chainId: '0x1',
                metadata: "{\"image\": \"https://lh3.googleusercontent.com/UTztxR5YVVKp0os_z82nIpJBnWFFnw3A1Tx4O4ufY8TUP3DWf6doyihOimP-eNO1CgiBjG3VREoSuw4HMttVwKPnvl1mPIXDViUDUA\"}",
                contract_type: 'ERC721',
                name: "PhantaBear",
                owner_of: "0xe5058b16b84afe3db3cd0a87bc46cb7b7169246b",
                symbol: "CAT",
                synced_at: "2022-02-19T08:29:58.028Z",
                syncing: 2,
                token_address: "0x67D9417C9C3c250f61A83C7e8658daC487B56B09",
                token_id: "2497",
                token_uri: "https://ipfs.moralis.io:2053/ipfs/QmbocQvS2ePbHVfojKrZYoscpM1HnrzhGgxY3FktoTRTGr/8444"
            })
        }
        return getSortedNfts(nftList)
    }, [ethNfts, maticNfts])

    useEffect(() => {
        if (selectedContracts.length === 0 && sortedNfts.length > 0) {
            setSelectedContracts(['1', sortedNfts[0].tokenAddress])
        }
    }, [sortedNfts])


    // Update metopia nft metadata loop
    useEffect(() => {
        for (let nft of metoNfts) {
            if (!nft.metadata) {
                // fetch(nft.token_uri, {
                fetch(nft.token_uri, {
                    // fetch(nft.token_uri.replace("https://storage.googleapis.com/test-metopia-meta/", "https://metopia.xyz/testmeta/meta/"), {
                    method: 'GET',
                    mode: 'cors',
                }).then(res => res.json()).then(res => {
                    if (!res)
                        return
                    let metadata = res
                    let newMetoNfts = metoNfts.map(i2 => {
                        if (nft.token_id.toLowerCase() === i2.token_id.toLowerCase()) {
                            return Object.assign({}, nft, { metadata: metadata })
                        }
                        return i2
                    })
                    setMetoNfts(newMetoNfts)
                }).catch((error) => {
                    console.error(error)
                    let newMetoNfts = metoNfts.map(i2 => {
                        if (nft.token_id.toLowerCase() === i2.token_id.toLowerCase()) {
                            return Object.assign({}, nft, { metadata: {} })
                        }
                        return i2
                    })
                    setMetoNfts(newMetoNfts)
                })
                break
            } else if (typeof nft.metadata == 'string') {
                let metadata = {}
                try {
                    metadata = JSON.parse(nft.metadata)
                } catch (e) {
                    console.error(e)
                }
                let newMetoNfts = metoNfts.map(i2 => {
                    if (nft.token_id.toLowerCase() === i2.token_id.toLowerCase()) {
                        return Object.assign({}, nft, { metadata: metadata })
                    }
                    return i2
                })
                setMetoNfts(newMetoNfts)
                break
            }
        }
    }, [metoNfts])



    const doResyncToken = (chainId, contract, tokenId) => {
        resyncToken(chainId, contract, tokenId, setSyncing, () => {
            setSyncing(false)
            alert('The image & metadata will be updated in couple of minutes.')
            setTimeout(() => {
                // window.location.reload()
            }, 2000);
        })
    }

    const isResultRead = () => {
        if (!generatingImages || generatingImages.length === 0)
            return true
        if (!aiResult)
            return false
        if (generatingImages && generatingImages.length > 0) {
            generatingImages.forEach(i => {
                if (!(aiResult.find(a => {
                    let chainId = '0x' + a.chainId.toString(16)
                    let nftAddr = a.nftAddr
                    let tokenId = a.tokenId
                    return chainId.toLowerCase() === i.chainId.toLowerCase() &&
                        nftAddr.toLowerCase() === i.nftAddr.toLowerCase() &&
                        tokenId.toLowerCase() === i.tokenId.toLowerCase()
                })))
                    return false
            });
        }
        return true
    }

    const isMinting = (a) => {
        if (!mintedImages)
            return false
        let chainId = '0x' + a.chainId.toString(16)
        let nftAddr = a.nftAddr
        let tokenId = a.tokenId
        let tmp = mintedImages.find(i => {
            return chainId.toLowerCase() === i.chainId.toLowerCase() &&
                nftAddr.toLowerCase() === i.nftAddr.toLowerCase() &&
                tokenId.toLowerCase() === i.tokenId.toLowerCase()
        })
        return tmp
    }
    let tmp = (user && user.wallet && user.wallet.chainId) ? chainMap[user.wallet.chainId] : '...'
    return <div className='AIActPage' >
        <div className="AIActMainContainer">
            <div className="AIActMenu Menu">
                <LogoIcon src='https://metopia.oss-cn-hongkong.aliyuncs.com/logo.svg' />
                <div className="MenuItemWrapper">
                    {aiMenuConfig.map(i => {
                        return <MenuItem {...i} key={'menuitem' + i.name} />
                    })}
                </div>
            </div>
            <div className="AIActContentContainer">
                <div className="AIActIntroductionContainer">
                    <img className="AIActIntroductionContainerBg" src="https://metopia.oss-cn-hongkong.aliyuncs.com/AIActIntroductionContainerBg.png" alt="" />
                    <div className="AIActIntroductionContainerText">
                        <div className="AIActIntroductionTitle">Metobot (Beta)</div>
                        <div className="AIActMainIntroduction" >
                            <p>While NFT art and avatars have boomed in the past year, there remains a significantly underpowered area for NFT designs. Once the design of an NFT is released, it's fixed immutably without further room for creative content. This goes opposite to how most virtual item designs allow for personalized add-ons and skins that give users a sense of individuality.</p>
                            <p>For the first time for NFTs, we are changing that and making creative expression to be possible on top of NFTs. On Metobot, NFT holders can upload their jpeg to add skins and customized wears to their NFT design!</p>
                        </div>
                    </div>
                    <img className='AIActIntroductionContainerObj' src="https://metopia.oss-cn-hongkong.aliyuncs.com/AIActIntroductionContainerObj.png" alt="" />
                </div>
                <div className="AIActFunctionalContainer">
                    <div className="AIActPageFormContainerLeft">
                        <div className="form-group">
                            <div className='AIActSubTitle'>NFT Assets</div>
                            <div className="AIActMainIntroduction">We support NFT Assets on Ethereum and Polygon.</div>
                            <div>
                                <div className="AIActMainIntroduction" >Please select one of your NFTs to create a new work.</div>
                                <div className="DownTipWrapper"><img src="https://metopia.oss-cn-hongkong.aliyuncs.com/↓.svg" alt="" /></div>
                                {
                                    <div className='NftCollectionNameButtonContainer'>
                                        {/* {
                                            sortedNfts().length > 0 ? <div className="NftCollectionNameButton" style={{ fontStyle: 'italic' }} onClick={() => {
                                                let tmp = sortedNfts().map(nftGroup => nftGroup.tokenAddress)
                                                setUnselectedContracts(tmp)
                                            }}>Hide All</div> : null
                                        } */}
                                        {sortedNfts.map(nftGroup => {
                                            if (!nftGroup.name || nftGroup.name.length === 0)
                                                return null
                                            return <NftCollectionNameButton key={'nftGroup--' + nftGroup.tokenAddress}
                                                selected={selectedContracts.find(t => t.toLowerCase() === nftGroup.tokenAddress.toLowerCase())}
                                                onClick={flag => {
                                                    let tmp = selectedContracts.map(i => i)
                                                    if (!tmp.find(c => c === nftGroup.tokenAddress)) {
                                                        tmp.push(nftGroup.tokenAddress)
                                                    } else {
                                                        tmp = tmp.filter(t => t !== nftGroup.tokenAddress)
                                                    }

                                                    setSelectedContracts(tmp)

                                                }}>{nftGroup.name}({nftGroup.data.length})</NftCollectionNameButton>
                                        })
                                        }</div>
                                }
                                {
                                    <div className="UserNftCardContainer">
                                        {sortedNfts.map(nftGroup => {
                                            if (!nftGroup.name || nftGroup.name.length === 0)
                                                return null
                                            if (!selectedContracts.find(i => i === nftGroup.tokenAddress))
                                                return null
                                            return nftGroup.data.map((nft, j) => {
                                                if (!nft.metadata)
                                                    return null
                                                let src = getNFTReadableSrc(nft)
                                                if (!src || src.length === 0) return null
                                                return <NftOptionCard selected={nftFind(selectedNfts, nft)}
                                                    key={'dragonKey-' + (nft.token_id || j) + "-" + nft.token_address}
                                                    src={src}
                                                    onClick={(e) => {
                                                        if (nftFind(selectedNfts, nft)) {
                                                            setSelectedNfts([])
                                                        } else {
                                                            setSelectedNfts([{ ...nft, img: e.target }])
                                                        }
                                                    }} />
                                            })
                                        })}
                                    </div>
                                }
                            </div>
                            <div> {user.wallet && user.wallet.account ? (!aiResult || aiResult.filter(a => a.status === 1).length >= 3 ? null :
                                <MainButton style={{ marginTop: '20px', marginRight: '20px' }} disabled={selectedNfts.length === 0 || (
                                    aiResult && aiResult.filter(a => a.status === 1 && a.nftAddr.toLowerCase() === selectedNfts[0].token_address.toLowerCase() &&
                                        a.tokenId === selectedNfts[0].token_id).length > 0)} solid onClick={async () => {
                                            if (sendingRequest || querying || selectedNfts.length === 0)
                                                return
                                            if (user.wallet.chainId !== '0x89') {
                                                await switchChain('0x89')
                                                return
                                            }
                                            setStep(0)
                                            let flag = await getWhiteListAddress(user.wallet.account, setQuerying)
                                            if (flag || (signature && signature.message)) {
                                                await generateAiImage(user.wallet.account, selectedNfts[0].chainId, selectedNfts[0].token_address, selectedNfts[0].token_id,
                                                    setSendingRequest, () => {
                                                        let tmp = [...generatingImages, { chainId: selectedNfts[0].chainId, nftAddr: selectedNfts[0].token_address, tokenId: selectedNfts[0].token_id }]
                                                        window.localStorage && window.localStorage.setItem("generatingImages", JSON.stringify(tmp))
                                                        setGeneratingImages(tmp)
                                                        alert('The transaction has been sent.')
                                                    })
                                            } else {
                                                setShowInput(true)
                                            }
                                        }}>
                                    {sendingRequest || querying ? <div className="ReactLoadingWrapper"><ReactLoading className="ReactLoading" /></div> : 'Generate'}</MainButton>
                            )
                                : <MainButton solid onClick={() => showLoginModal(1)} style={user.wallet && user.wallet.account && { display: 'none' }}>Connect Wallet</MainButton>}
                                {
                                    user.wallet && user.wallet.account ? <MainButton style={{ marginTop: '20px' }} solid disabled={selectedNfts.length === 0} onClick={async () => {
                                        if (syncing)
                                            return
                                        doResyncToken(selectedNfts[0].chainId, selectedNfts[0].token_address, selectedNfts[0].token_id)
                                    }}>
                                        {syncing ? <div className="ReactLoadingWrapper"><ReactLoading className="ReactLoading" /></div> : 'Refresh'}
                                    </MainButton> : null
                                }
                            </div>
                        </div>
                    </div>
                    <div className="AIActPageFormContainerRight">
                        <div className="AIActSubTitle">User Profile</div>
                        <div className="AIFormGroup">
                            <Label>Address</Label>
                            <div className="AIActInfoValue">
                                {user.wallet && user.wallet.account ? addrShorten(user.wallet.account) : '...'}
                                {user.wallet && user.wallet.account ? <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/logout.svg" onClick={() => dispatch(logout())} alt="Log out" title="Log out"
                                    className="LogoutButton" /> : null}
                            </div>
                        </div>
                        <div className="AIFormGroup">
                            <Label>Chain</Label>
                            <div className="AIActInfoValue" >{tmp}</div>
                            {
                                user.wallet && user.wallet.chainId !== '0x89' ? <div className="AIActMainIntroduction" style={{ marginBottom: '15px', marginTop: '15px' }}>Our service is deployed on Polygon. Please&nbsp;
                                    <span className="Underline" onClick={async () => {
                                        await switchChain('0x89')
                                    }}>switch</span> to Polygon.</div> : null
                            }
                        </div>
                        <div className="AIFormGroup" style={{ marginTop: '40px', display: user.wallet && user.wallet.account ? 'block' : 'none' }}>
                            <div className="AIActSubTitle">My Creation</div>
                            <div className="AIActInfoValue">{
                                aiResult ? (aiResult.map((info, j) => {
                                    // if (info.image == 'None')
                                    //     return 
                                    let altImg = null

                                    let chainId = '0x' + info.chainId.toString(16)
                                    let nftAddr = info.nftAddr
                                    let tokenId = info.tokenId
                                    let tmpp
                                    let tmp = sortedNfts.find(g => {
                                        return g.tokenAddress.toLowerCase() === nftAddr.toLowerCase()
                                    })

                                    if (tmp) {
                                        tmpp = tmp.data.find(t => t.token_id.toLowerCase() === tokenId.toLowerCase()) &&
                                            tmp.data.find(t => t.token_id.toLowerCase() === tokenId.toLowerCase())
                                        if (tmpp)
                                            altImg = getNFTReadableSrc(tmpp)
                                    }
                                    if (info.status === 1 && info.image !== 'None') {
                                        let nft = metoNfts.find(n => {
                                            if (n.metadata && typeof n.metadata == 'object') {
                                                if (n.metadata.attributes && n.metadata.attributes.length >= 3 &&
                                                    n.metadata.attributes[1].value.toLowerCase() === nftAddr.toLowerCase() &&
                                                    n.metadata.attributes[2].value.toLowerCase() === tokenId.toLowerCase()) {
                                                    return n
                                                }
                                            }
                                        })
                                        let attributes = null
                                        let designer = 'None'
                                        if (nft) {
                                            attributes = nft.metadata.attributes
                                            designer = attributes.find(a => a.trait_type === 'Designer') && attributes.find(a => a.trait_type === 'Designer').value
                                        }

                                        return <div className="MyCreationCard" key={'MyCreationCard' + info.tokenId + info.nftAddr}>
                                            <img src={'data:image/png;base64,' + info.image} className="MyCreationCardImg" alt="MyCreation" />
                                            {
                                                attributes ? <div>
                                                    <div>
                                                        <div className="MyCreationCardAttrTitle">Metopian Profile</div>
                                                        <div className='MyCreationCardAttrItem'><div>Metopian Id:</div><div>#{nft.token_id}</div>
                                                        </div>
                                                        {/* <div className="MyCreationCardId">Metopian Id: #{nft.token_id}</div> */}
                                                    </div>
                                                    <div className="MyCreationCardAttrWrapper">
                                                        <div className="MyCreationCardAttrTitle">Original Image</div>
                                                        <div className='MyCreationCardAttrItem'><div>Chain:</div><div>{chainMap['0x' + parseInt(attributes[0].value).toString(16)]}</div></div>
                                                        <div className='MyCreationCardAttrItem'><div>Contract:</div><div>
                                                            <a href={chainExplorerMap['0x' + attributes[0].value] + attributes[1].value}>
                                                                {addrShorten(nftAddr)}
                                                            </a></div></div>
                                                        <div className='MyCreationCardAttrItem'><div>Token Id:</div><div>{tokenId}</div></div>
                                                        <div className='MyCreationCardAttrItem'><div>Designer:</div><div>{designer || 'None'}</div></div>
                                                    </div>
                                                </div> : (<div>
                                                    <MainButton solid style={{ width: '100px' }} onClick={async () => {
                                                        if (minting)
                                                            return
                                                        setStep(1)
                                                        setMintingImage({ chainId, nftAddr: info.nftAddr, tokenId: info.tokenId })

                                                        let flag = await getWhiteListAddress(user.wallet.account, setQuerying)
                                                        if (flag) {
                                                            await wl_mint(user.wallet.account, chainId,
                                                                info.nftAddr,
                                                                info.tokenId,
                                                                setMinting,
                                                                () => {
                                                                    let tmp = [...mintedImages, { chainId: chainId, nftAddr: info.nftAddr, tokenId: info.tokenId }]
                                                                    window.localStorage && window.localStorage.setItem("mintedImages", JSON.stringify(tmp))
                                                                    setMintedImages(tmp)
                                                                    alert('The transaction is complished.')
                                                                    setTimeout(() => {
                                                                        window.location.reload()
                                                                    }, 3000);
                                                                })
                                                        }
                                                        else if ((signature && signature.message)) {
                                                            await mint(user.wallet.account, signature, chainId,
                                                                info.nftAddr,
                                                                info.tokenId,
                                                                setMinting,
                                                                () => {
                                                                    let tmp = [...mintedImages, { chainId: chainId, nftAddr: info.nftAddr, tokenId: info.tokenId }]
                                                                    window.localStorage && window.localStorage.setItem("mintedImages", JSON.stringify(tmp))
                                                                    setMintedImages(tmp)
                                                                    alert('The transaction is complished.')
                                                                    setTimeout(() => {
                                                                        window.location.reload()
                                                                    }, 3000);
                                                                })
                                                        } else {
                                                            setShowInput(true)
                                                        }
                                                    }}>{minting || isMinting(info) ? <div className="ReactLoadingWrapper short"><ReactLoading className="ReactLoading" /></div> : 'Mint'}</MainButton>
                                                </div>)
                                            }

                                        </div>
                                    } else if (info.status === 2 || info.status === 3 || info.status === 4 || info.image === 'None') {
                                        // if (altImg)
                                        return <div className="MyCreationCard error" key={'MyCreationCard' + j}>
                                            <img src={altImg} className="MyCreationCardImg" alt="MyCreation" />
                                            <div>
                                                <div className="MyCreationCardError">Error: {aiErrors[info.status + '']}</div>
                                            </div>
                                        </div>
                                    } else {
                                        if (altImg)
                                            return <div className="MyCreationCard error" key={'MyCreationCard' + j}>
                                                <img src={altImg} className="MyCreationCardImg" alt="MyCreation" />
                                                <div>
                                                    <div className="MyCreationCardError">Error: The result is not valid</div>
                                                </div>
                                            </div>
                                    }
                                })) : null
                            }
                                {aiResult && isResultRead() ? null :
                                    <ReactLoading className='ReactLoading' color="#333333" />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal appElement={document.getElementById('root')}
            isOpen={showInput}
            onRequestClose={() => {
                setShowInput(false);
                setShowActivateButton(false)
            }}
            style={whitelistModalStyle}>
            <input className="WhiteListInput" id="WhiteListInput" placeholder='Paste invitation code here.' onChange={e => {
                if (e.target.value.length > 0)
                    setShowActivateButton(true)
                else {
                    setShowActivateButton(false)
                }
            }} />
            <div className={"WhiteListActivateButton" + (showActivateButton ? ' display' : '')} onClick={async e => {
                if (verifying)
                    return
                let result = await verifyWhitelist((document.getElementById('WhiteListInput') as HTMLInputElement).value, setVerifying)
                if (result) {
                    setSignature(result)
                    setShowInput(false);
                    setShowActivateButton(false);
                    if (step === 0) {
                        await generateAiImage(user.wallet.account, selectedNfts[0].chainId, selectedNfts[0].token_address, selectedNfts[0].token_id,
                            setSendingRequest, () => {
                                let tmp = [...generatingImages, { chainId: selectedNfts[0].chainId, nftAddr: selectedNfts[0].token_address, tokenId: selectedNfts[0].token_id }]
                                window.localStorage && window.localStorage.setItem("generatingImages", JSON.stringify(tmp))
                                setGeneratingImages(tmp)
                                alert('The transaction has been sent.')
                            })
                    } else if (step === 1) {
                        let { chainId, nftAddr, tokenId } = mintingImage
                        await mint(user.wallet.account, result, chainId, nftAddr, tokenId,
                            setMinting,
                            () => {
                                let tmp = [...mintedImages, { chainId: chainId, nftAddr: nftAddr, tokenId: tokenId }]
                                window.localStorage && window.localStorage.setItem("mintedImages", JSON.stringify(tmp))
                                setMintedImages(tmp)
                                setSignature(null)
                                alert('The transaction is complished.')
                                setTimeout(() => {
                                    window.location.reload()
                                }, 3000);
                            })
                    }
                }
            }}>{verifying ? <ReactLoading className="ReactLoading" /> : 'Verify'}</div>
        </Modal >
    </div >
}

export default AIActPage