import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Triangle } from 'react-loader-spinner';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount } from '../../config/redux/userSlice';
import type { RootState } from '../../config/store';
import { type MoralisNft } from '../../config/type/moralisType';
import { localRouter } from '../../config/urls';
import FlexibleOrderedContainer from '../../module/FlexibleOrderedContainer';
import { NftCollectionNameButton, NftOptionCard } from '../../module/nft';
import { getAccountData } from '../../third-party/ceramic';
import { useNfts } from '../../third-party/moralis';
import { getNFTReadableSrc, getSortedNfts, nftEqual } from '../../utils/NftUtils';
import { getAddress, getChainId } from '../../utils/web3Utils';
import { MainButton } from '../button';
import './index.css';
import { useLoginModal } from './useLoginModal';
import { chainId } from '../../config/constant';

const defaultLoginModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '752px',
        //  height: '542px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '32px',
        padding: 0,
        overflow: 'hidden',
    }
}

const stepsConfig = [
    {
        title: 'Connect Wallet',
        icon: 'https://metopia.oss-cn-hongkong.aliyuncs.com/connectwallet.svg'
    },
    // {
    //     title: 'Create Account',
    //     icon: 'https://metopia.oss-cn-hongkong.aliyuncs.com/settingspurple.svg'
    // }, {
    //     title: 'Choose Avatar',
    //     icon: 'https://metopia.oss-cn-hongkong.aliyuncs.com/accountpurple.svg'
    // }
]

const walletConfig = [
    {
        title: 'Metamask',
        icon: 'https://oss.happyblocklabs.com/platform/web/imgs/metamask.svg'
    }, {
        title: 'Phantom',
        icon: 'https://metopia.oss-cn-hongkong.aliyuncs.com/phantom.svg',
        disabled: true
    }
]

const StepIcon = (props: { title, icon, active }) => {
    return <div className={"StepIcon" + (props.active ? ' active' : '')}>
        <div className="StepIconWrapper"><img src={props.icon} alt={props.title} /></div>
        <div className="StepIconTitle">{props.title}</div>
    </div>
}

const WalletIcon = (props) => {
    return <div className={"WalletIcon" + (props.active ? ' active' : '') + (props.disabled || props.loading ? ' disabled' : '')} onClick={() => {
        if (!props.disabled && !props.loading)
            props.onSelected()
    }}
        title={props.disabled ? 'Coming soon' : ''}>
        <div className="WalletIconWrapper">
            {/* <ReactLoading /> */}
            {
                props.loading ? <Triangle
                    height="40"
                    width="40"
                    color='#5A49DE'
                    ariaLabel='loading'
                /> : <img src={props.icon} alt={props.title} />
            }
        </div>
        <div className="WalletIconTitle">{props.title}</div>
    </div>
}

const connectToMetamask = async () => {
    try {
        let account = await getAddress()
        let chainId = await getChainId()
        return { account, chainId }
    } catch (e) {
        console.error(e)
        return {}
    }
}

const LoginModal = (props: {
    style?
}) => {
    // const [nfts, setNfts] = useState([])
    // const [isLoadingNfts, setIsLoadingNfts] = useState(false)
    const [selectedNft, setSelectedNft] = useState(null)
    const dispatch = useDispatch()
    // const user = useSelector((state: RootState) => state.user)
    const { isShow, stepRequired } = useSelector((state: RootState) => state.loginModal)
    const { hide } = useLoginModal()
    const { data: nfts, error: ethError } = useNfts(null, chainId)
    const [step, setStep] = useState<number>(0)
    const [unselectedContracts, setUnselectedContracts] = useState([])
    const [ceramicAccountInfoDoc, setCeramicAccountInfoDoc] = useState<any>()
    const chainChangedHander = useRef<any>()
    const accountsChangedHander = useRef<any>()
    const initFlag = useRef(false)
    const [loadingAccount, setLoadingAccount] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        // const initAccount = async () => {
        //     let { account } = await connectToMetamask()
        //     if (account) {
        //         let doc = await getAccountData()
        //         if (doc && doc.content && doc.content['username']) {
        //             dispatch(setAccount(doc.content))
        //         }
        //     }
        // }

        // if (!initFlag.current) {
        //     initFlag.current = true
        //     if (!user.account)
        //         initAccount()
        // }
    })

    useEffect(() => {
        chainChangedHander.current = async function () {
            let { account, chainId } = await connectToMetamask()
            if (account) {
                // dispatch(setWallet({ account, chainId }))
            }
        }

        accountsChangedHander.current = async function () {
            let { account, chainId } = await connectToMetamask()
            if (account) {
                window.location.href = localRouter('profile')
                //     dispatch(setWallet({ account, chainId }))
            }
        }

        if ((window as any).ethereum) {
            // window.ethereum.on('chainChanged', chainChangedHander.current)
            // window.ethereum.on('accountsChanged', accountsChangedHander.current)
        }

        return () => {
            if ((window as any).ethereum) {
                // window.ethereum.removeListener('chainChanged', chainChangedHander.current)
                // window.ethereum.removeListener('accountsChanged', accountsChangedHander.current)
            }
        }
    })
    const sortedNfts = useMemo(() => {
        if (!nfts)
            return []
        let nftList: MoralisNft[] = []
        if (nfts)
            nftList.push(...(nfts.result.filter(item => item.metadata).map(item => {
                return Object.assign({}, item, { chainId: chainId })
            })))
        return getSortedNfts(nftList)
    }, [nfts])

    const NftOptionCards = useMemo(() => {
        return sortedNfts.map(nftGroup => {
            if (unselectedContracts.find(i => i === nftGroup.tokenAddress))
                return null
            return nftGroup.data.map((nft, j) => {
                if (!nft.metadata)
                    return null
                let src = getNFTReadableSrc(nft)
                if (!src || src.length === 0) return null
                return <NftOptionCard selected={nftEqual(selectedNft, nft)}
                    key={'dragonKey-' + (nft.token_id || j) + "-" + nft.token_address}
                    src={src}
                    onClick={(e) => {
                        if (nftEqual(selectedNft, nft)) {
                            setSelectedNft(null)
                        } else {
                            setSelectedNft(nft)
                        }
                    }} />
            })
        })
    }, [sortedNfts, selectedNft])

    const NFTLabels = useMemo(() => {
        return sortedNfts.map(nftGroup => {
            return <NftCollectionNameButton key={'nftGroup--' + nftGroup.name}
                onClick={flag => {
                    let tmp = unselectedContracts.map(i => i)
                    if (!flag) {
                        tmp.push(nftGroup.tokenAddress)
                    } else {
                        tmp = tmp.filter(t => t != nftGroup.tokenAddress)
                    }
                    setUnselectedContracts(tmp)
                }}>{nftGroup.name}({nftGroup.data.length})</NftCollectionNameButton>
        })
    }, [sortedNfts, unselectedContracts])

    const selectWallet = async () => {
        if ((window as any).ethereum && !(window as any).ethereum._state.initialized) {
            alert('Please refresh the application to get your MetaMask ready.')
            hide()
            return
        }
        setLoadingAccount(true)
        let { account, chainId } = await connectToMetamask()
        if (account) {
            try {
                // dispatch(setWallet({ account, chainId }))
                if (stepRequired === 2) {
                    // TODO // TODO // TODO // TODO // TODO
                    let doc = await getAccountData()
                    console.log(doc.content)
                    if (doc.content && doc.content['username']) {
                        dispatch(setAccount(doc.content))
                        hide()
                    } else {
                        setCeramicAccountInfoDoc(doc)
                        setStep(1)
                    }
                    setLoadingAccount(false)
                } else {
                    // dispatch(setAccount({
                    //     introduction: "placeholder",
                    //     username: "placeholder"
                    // }))
                    hide()
                    setLoadingAccount(false)
                    window.location.href = localRouter("profile")
                }
            } catch (e) {
                console.error(e)
                setLoadingAccount(false)
            }
        } else {
            setLoadingAccount(false)
        }
    }

    const onSubmitUserSetting = async (data) => {
        // console.log(data)
        try {
            await ceramicAccountInfoDoc.update(data)
            dispatch(setAccount(data))
            setStep(2)
        } catch (e) {
            alert('Account creation failed.')
        }
    }

    return <Modal
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={hide}
        style={Object.assign({}, defaultLoginModalStyle, props.style || {})}>
        <div className="LoginModalContainer">
            <div className='LoginModalTitle'>{stepsConfig[step].title}</div>
            <div className={"LoginModalStepInfoContainer" + (step === 0 ? ' hidden' : '')}>
                {stepsConfig.map((stepInfo, i) => <StepIcon key={"stepicon" + i} title={stepInfo.title} icon={stepInfo.icon} active={i <= step} />)}
            </div>
            {
                step === 0 ? <div className="LoginModalWalletContainer">
                    {walletConfig.map((wallet, i) => <WalletIcon key={"walleticon" + i} loading={loadingAccount}
                        title={wallet.title} icon={wallet.icon} active={false} disabled={wallet.disabled}
                        onSelected={selectWallet} />)}
                </div> : null
            }{
                step === 1 ? <div className='ModalUserSettingContainer'>
                    <form>
                        <div className="ModalUserSettingGroup">
                            <label>Username</label>
                            <input {...register('username', { required: true })} />
                            {errors.username && <p className="ErrorHint">Username is required</p>}
                        </div>
                        <div className="ModalUserSettingGroup">
                            <label>Introduction</label>
                            <input {...register('introduction')} />
                        </div>
                        <div className="LoginModalButtonContainer">
                            <MainButton solid onClick={handleSubmit(onSubmitUserSetting)}>Confirm</MainButton>
                            <MainButton solid onClick={() => { setStep(step - 1) }}>Previous</MainButton>
                        </div>
                    </form>

                </div> : null
            }{
                step === 2 ? <div className="LoginModalAvatarContainer">
                    <div className='NftCollectionNameButtonContainer'>
                        {NFTLabels}
                    </div>
                    <FlexibleOrderedContainer elementMinWidth={90} elementMaxWidth={120} gap={10} style={{ marginTop: '10px' }} >
                        {NftOptionCards}
                    </FlexibleOrderedContainer>
                </div> : null
            }{
                step > 1 ? <div className="LoginModalButtonContainer">
                    <MainButton solid onClick={() => {
                        if (step === 1) {
                            // handleSubmit(onSubmitUserSetting)
                        } else if (step === 2) {
                            if (!selectedNft)
                                return
                            let content = ceramicAccountInfoDoc.content
                            content.avatar = selectedNft
                            dispatch(setAccount(content))
                            hide()
                        }

                    }}>Confirm</MainButton>
                    <MainButton solid onClick={() => { setStep(step - 1) }}>Previous</MainButton>
                </div> : null
            }
        </div>


    </Modal >
}

export { useLoginModal };
export default LoginModal