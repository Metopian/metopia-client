import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Triangle } from 'react-loader-spinner';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount } from '../../config/redux/userSlice';
import { RootState, useChainId } from '../../config/store';
import { type MoralisNft } from '../../config/type/moralisType';
import { localRouter } from '../../config/urls';
import FlexibleOrderedContainer from '../../module/FlexibleOrderedContainer';
import { NftOptionCard } from '../../module/nft';
import { getAccountData } from '../../third-party/ceramic';
import { useNfts } from '../../third-party/moralis';
import { getNFTReadableSrc, getSortedNfts, nftEqual } from '../../utils/NftUtils';
import { getAddress, getChainId } from '../../utils/web3Utils';
import { MainButton } from '../button';
import './index.scss';
import { useLoginModal } from './useLoginModal';


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
        icon: 'https://oss.metopia.xyz/connectwallet.svg'
    },
    // {
    //     title: 'Create Account',
    //     icon: 'https://oss.metopia.xyz/settingspurple.svg'
    // }, {
    //     title: 'Choose Avatar',
    //     icon: 'https://oss.metopia.xyz/accountpurple.svg'
    // }
]

const walletConfig = [
    {
        title: 'Metamask',
        icon: 'https://oss.happyblocklabs.com/platform/web/imgs/metamask.svg'
    }, {
        title: 'Phantom',
        icon: 'https://oss.metopia.xyz/phantom.svg',
        disabled: true
    }
]

const StepIcon = (props: { title, icon, active }) => {
    return <div className={"step-icon" + (props.active ? ' active' : '')}>
        <div className="img-wrapper"><img src={props.icon} alt={props.title} /></div>
        <div className="title">{props.title}</div>
    </div>
}

const WalletIcon = (props) => {
    return <div className={"wallet-icon" + (props.active ? ' active' : '') + (props.disabled || props.loading ? ' disabled' : '')} onClick={() => {
        if (!props.disabled && !props.loading)
            props.onSelected()
    }}
        title={props.disabled ? 'Coming soon' : ''}>
        <div className="icon-wrapper">
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
        <div className="title">{props.title}</div>
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
    const { isShow, stepRequired } = useSelector((state: RootState) => state.modalController.loginModal)
    const { hide } = useLoginModal()
    const { chainId } = useChainId()
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
    }, [nfts, chainId])

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
    }, [sortedNfts, selectedNft, unselectedContracts])

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
                    // console.log(doc.content)
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
        <div className="login-modal-container">
            <div className='title'>{stepsConfig[step].title}</div>
            <div className={"step-container" + (step === 0 ? ' hidden' : '')}>
                {stepsConfig.map((stepInfo, i) => <StepIcon key={"stepicon" + i} title={stepInfo.title} icon={stepInfo.icon} active={i <= step} />)}
            </div>
            {
                step === 0 ? <div className="wallet-container">
                    {walletConfig.map((wallet, i) => <WalletIcon key={"walleticon" + i} loading={loadingAccount}
                        title={wallet.title} icon={wallet.icon} active={false} disabled={wallet.disabled}
                        onSelected={selectWallet} />)}
                </div> : null
            }{
                step === 1 ? <div className='setting-container'>
                    <form>
                        <div className="form-group">
                            <label>Username</label>
                            <input {...register('username', { required: true })} />
                            {errors.username && <p className="error-hint">Username is required</p>}
                        </div>
                        <div className="form-group">
                            <label>Introduction</label>
                            <input {...register('introduction')} />
                        </div>
                        <div className="button-container">
                            <MainButton solid onClick={handleSubmit(onSubmitUserSetting)}>Confirm</MainButton>
                            <MainButton solid onClick={() => { setStep(step - 1) }}>Previous</MainButton>
                        </div>
                    </form>
                </div> : null
            }{
                step === 2 ? <div className="avatar-container">
                    {/* TODO */}
                    <FlexibleOrderedContainer elementMinWidth={90} elementMaxWidth={120} gap={10} style={{ marginTop: '10px' }} >
                        {NftOptionCards}
                    </FlexibleOrderedContainer>
                </div> : null
            }{
                step > 1 ? <div className="button-container">
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