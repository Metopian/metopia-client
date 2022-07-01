import React, { useCallback, useEffect, useRef, useState } from 'react'
import cookie from 'react-cookies'
import { useDebouncedCallback } from 'use-debounce'
import { useChainId } from '../../../../config/store'
import { nftDataApi } from '../../../../config/urls'
import { Input, Label } from '../../../../module/form'
import { NftImage } from '../../../../module/image'
import { getRandomNft } from '../../../../third-party/moralis'
import { pad } from '../../../../utils/stringUtils'
import { getContract } from '../../../../utils/web3Utils'
import BonusInputCard from './BonusInputCard'
import './MembershipCardInput.scss'
import ReactLoading from 'react-loading';
import { max } from '../../../../utils/numberUtils'

const MembershipCardInput = React.forwardRef<any, any>((props, ref) => {
    const { onSubmit, onChange, onDelete, editing, onEdit, displayedId } = props
    const { id, name, tokenAddress, defaultWeight, bonus } = props
    const [attributesList, setAttributesList] = useState<any>()
    const [imgUrl, setImgUrl] = useState('')
    const [tokenId, setTokenId] = useState(null)
    // const [data, setData] = useState<any>({ id: props.id, name: '', tokenAddress: '',   defaultWeight: 1 })
    const [contractError, setContractError] = useState(null)
    const [syncingAttribute, setSyncingAttribute] = useState(false)
    // const [syncingAttribute, setSyncingAttribute] = useState(false)
    const { chainId } = useChainId()
    const [queryingNft, setQueryingNft] = useState(false)

    const fetchRandomNftAndSetState = (addr) => {
        if (!addr) {
            setImgUrl('')
            setTokenId(null)
            return
        }
        getRandomNft(chainId, addr, data => {
            let metadata = JSON.parse(data && data.result[0] ? data.result[0].metadata : null)
            setTokenId(data?.result[0]?.token_id)
            setImgUrl(metadata?.image || metadata?.image_url || '')
        })
    }

    const previousTokenAddress = useRef()
    const queryNft = useDebouncedCallback(
        (addr) => {
            if (addr?.length && addr === previousTokenAddress.current)
                return
            previousTokenAddress.current = addr
            if (addr.indexOf('0x') !== 0) {
                return
            }
            const process = async () => {
                setQueryingNft(true)
                try {
                    let name = await getContract(addr, require('../../../../config/abi/ERC721.json').abi).name()
                    onChange(getFormData({
                        name, tokenAddress: addr
                    }))
                    queryAttributes(addr)
                    fetchRandomNftAndSetState(addr)
                    setContractError(null)
                } catch (e) {
                    console.error(e)
                    onChange(getFormData({
                        name: '', tokenAddress: ''
                    }))
                    fetchRandomNftAndSetState(null)
                    setContractError(e)
                    setTimeout(() => {
                        onChange(getFormData())
                    }, 0);
                } finally {
                    setQueryingNft(false)
                }
            }
            process()
        },
        300
    );

    useEffect(() => {
        queryNft(tokenAddress)
    }, [tokenAddress, queryNft])

    const queryAttributes = (addr) => {
        let cachedContract = cookie.load('cachedContract') || []
        if (!cachedContract?.find(c => c === addr)) {
            fetch(nftDataApi.nft_cacheAll + "?chain_id=" + chainId + "&address=" + addr).then(r => r.json()).then(r => {
                setSyncingAttribute(true)
                cookie.save('cachedContract', JSON.stringify([...cachedContract, addr]), { path: "/" })
                fetch(nftDataApi.nft_attributes + "?chain_id=" + chainId + "&address=" + addr).then((res) => {
                    return res.json()
                }).then(res => {
                    let attrs = res.data.attributes
                    if (attrs) {
                        setAttributesList(Object.keys(attrs).map(key => { return { field: key, values: attrs[key] } }))
                    }
                    if (res.data.syncing) {
                        /**
                         * Poll per 3 sec until syncing finished
                         */
                        setTimeout(() => {
                            queryAttributes(addr)
                        }, 3000);
                    }
                })
            })
        } else {
            fetch(nftDataApi.nft_attributes + "?chain_id=" + chainId + "&address=" + addr).then((res) => {
                return res.json()
            }).then(res => {
                let attrs = res.data.attributes
                if (attrs)
                    setAttributesList(Object.keys(attrs).map(key => { return { field: key, values: attrs[key] } }))
                if (res.data.syncing) {
                    setTimeout(() => {
                        queryAttributes(addr)
                    }, 3000);
                } else {
                    setSyncingAttribute(false)
                }
            })
        }
    }

    const getFormData = useCallback((params?) => {
        return Object.assign({},
            {
                id, name, tokenAddress, defaultWeight, editing,
                bonus: bonus?.filter(b => b.value) || []
            },
            params || {})
        // , sampleImage: imgUrl, sampleTokenId: tokenId

    }, [id, name, tokenAddress, defaultWeight, bonus, editing])

    const submit = useCallback(() => {
        if (contractError || !tokenAddress?.length) {
            setContractError("empty")
            return false
        } else {
            onSubmit(getFormData())
            return getFormData()
        }
    }, [contractError, tokenAddress, getFormData, onSubmit])

    useEffect(() => {
        (ref as any).current[displayedId - 1] = () => {
            if (editing)
                return submit()
            return getFormData()
        }
        return () => {
            (ref as any).current[displayedId - 1] = null
        }
    }, [ref, displayedId, editing, submit, getFormData])

    if (editing)
        return <div className='membership-card-input'>
            <div className="title" style={{ backgroundImage: 'url("/imgs/membershipcardbg.png")' }}>
                <div className='text'>{pad(displayedId, 2)} {name?.length ? name : "[Please provide NFT Contract]"}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <img src="/imgs/tick_purple.svg" alt="" className='confirm-button tick' onClick={submit} />
                    <img src="/imgs/close_purple4.svg" alt="" className='confirm-button' style={{ height: '24px' }} onClick={() => {
                        (ref as any).current[displayedId - 1] = null
                        onDelete(id)
                    }} />
                </div>
            </div>
            <div className="container">
                <Label style={{ fontWeight: 'bold', marginBottom: '12px' }}>Basic rights</Label>
                <div className="left-container" style={{ border: 'none' }}>
                    <div className="membership-form-group">
                        <div className="form-group">
                            <Label>Voting power per token</Label>
                            <Input id="createclubcontractinput" value={defaultWeight || 1} disabled type="number" onChange={(e) => {
                                onChange(getFormData({ defaultWeight: e.target.value }))
                            }} />
                        </div>
                        <div className="form-group">
                            <Label>NFT Contract Address</Label>
                            <Input id="createclubcontractinput" value={tokenAddress || ""} className={contractError ? " error" : ''} placeholder={""}
                                onChange={(e) => {
                                    onChange(getFormData({
                                        name: '',
                                        tokenAddress: e.target.value, editing,
                                        bonus: []
                                    }))
                                    // queryNft(e.target.value)
                                }} />
                            {contractError && <p className="ErrorHint">{"Contract not found"}</p>}
                        </div>
                    </div>
                </div>
                <div className="right-container" style={{ border: 'none' }} >
                    <div className="membership-form-group">
                        <div className="form-group">
                            <Label>Name</Label>
                            <div className="r-input fake"  >
                                {queryingNft ? <ReactLoading height={'20px'} width={'20px'} className="loadingicon" color='#666' /> : (name || "Obtained automatically")}
                            </div>
                        </div>
                        <div className="form-group">
                            <Label>Symbol</Label>
                            <div className="r-input fake">
                                {queryingNft ? <ReactLoading height={'20px'} width={'20px'} className="loadingicon" color='#666' /> : (name || "Obtained automatically")}
                            </div>
                        </div>
                    </div>
                </div>
                {
                    name?.length || bonus?.length ? <div style={{ paddingBottom: '12px', paddingTop: '32px', marginTop: '24px', borderTop: '1px solid #dddddd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'flex-start' }}>
                            <Label style={{ fontWeight: 'bold', marginBottom: '0' }}>Bonus</Label>
                            <div className="add-more-bonus-button" onClick={() => {
                                let maxId = max(bonus, 'id')
                                onChange(getFormData({ bonus: [...bonus, { id: maxId + 1, weight: 1, type: -1 }] }))
                            }}><img src="/imgs/addbuttonround.png" alt="" />Add Bonus</div>
                        </div>
                        {
                            bonus?.map((b, i) => {
                                return <BonusInputCard data={b} key={"BonusInputCard" + i} id={b.id} displayedId={i + 1} attributesList={attributesList}
                                    onChange={(d) => {
                                        let tmp = bonus.map(btmp => {
                                            return d.id === btmp.id ? Object.assign({}, btmp, d) : btmp
                                        })
                                        onChange(getFormData({ bonus: tmp }))
                                    }} onClose={(id) => {
                                        onChange(getFormData({ bonus: bonus.filter(b => b.id !== id) }))
                                    }} syncing={syncingAttribute} />
                            })
                        }
                    </div> : null
                }

            </div>
        </div>
    else {
        return <div className="membership-card-preview-card">
            <div className="title" style={{ background: 'url("/imgs/membershipcardbg.png")', backgroundSize: 'cover' }}>
                <div className='text'>{pad(displayedId, 2)} {name?.length ? name : "[NFT]"}</div>
            </div>

            <div className="main-container">
                {
                    imgUrl ? <div className={'sample-image-wrapper'}>
                        <NftImage defaultSrc={imgUrl} chainId={chainId} tokenId={tokenId} contract={tokenAddress} width={100}
                            className={"sample-image"} />
                    </div> : null
                }
                <div className='text-wrapper'>
                    <div className='group'>
                        <div className='title'>Name</div>
                        <div className='text'>{name}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }} className='group'>
                        <div className='title'>Contract</div>
                        <div className='text'>{tokenAddress}</div>
                    </div>
                </div>
                <img alt="edit" title="edit" src="/imgs/write2.svg" className='edit-button' onClick={() => {
                    onEdit(id)
                }} />
            </div>
            <div className="bonus-container">
                {
                    false&&bonus?.filter(b => b.value?.length)?.length ? <div className="title">Bonus</div> : null
                }
                <div className="body" style={{display:'none'}}>
                    {
                        false&&bonus?.filter(b => b.value?.length).map((b, i) => {
                            return <div className="bonus-display-card" key={'bonusDisplayCard' + i}>
                                <div>
                                    <div className='title'>Trait</div>
                                    <div className='text'>{b.field}</div>
                                </div>
                                <div>
                                    <div className='title'>Requirement</div>
                                    <div className='text'>{b.value.map((v, j) =>
                                        <div key={'bonusDisplayCardValue' + i + "-" + j}>{v.text}</div>
                                    )}</div>
                                </div>
                                <div>
                                    <div className='title'>Bonus</div>
                                    <div className='text'>{b.weight}%</div>
                                </div>
                            </div>
                        })
                    }
                </div>

            </div>
        </div>
    }
})

export default MembershipCardInput