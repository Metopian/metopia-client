import React, { useCallback, useEffect, useState } from 'react'
import cookie from 'react-cookies'
import { useDebouncedCallback } from 'use-debounce'
import { chainId } from '../../../../config/constant'
import { nftDataApi } from '../../../../config/urls'
import { Input, Label } from '../../../../module/form/Form'
import { NftImage } from '../../../../module/image'
import { getRandomNft } from '../../../../third-party/moralis'
import { pad } from '../../../../utils/stringUtils'
import { getContract } from '../../../../utils/web3Utils'
import BonusInputCard from './BonusInputCard'
import './MembershipCardInput.css'

const MembershipCardInput = React.forwardRef<any, any>((props, ref) => {
    const { onSubmit, onChange, onDelete, editing, onEdit, displayedId } = props
    const { id, name, tokenAddress, defaultWeight, bonus } = props
    const [attributesList, setAttributesList] = useState<any>()
    const [imgUrl, setImgUrl] = useState('')
    const [tokenId, setTokenId] = useState(null)
    // const [data, setData] = useState<any>({ id: props.id, name: '', tokenAddress: '',   defaultWeight: 1 })
    const [contractError, setContractError] = useState(null)
    const [syncingAttribute, setSyncingAttribute] = useState(false)

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

    const queryNft = useDebouncedCallback(
        (addr) => {
            if (addr.indexOf('0x') !== 0) {
                return
            }
            const process = async () => {
                try {
                    let name = await getContract(addr, require('../../../../config/abi/ERC721.json').abi).name()
                    console.log(name)
                    onChange(getFormData({
                        name, tokenAddress: addr
                    }))
                    // data.name = name
                    // data.tokenAddress = addr
                    // setData(data)
                    queryAttributes(addr)
                    fetchRandomNftAndSetState(addr)
                    setContractError(null)
                } catch (e) {
                    console.error(e)
                    onChange(getFormData({
                        name: '', tokenAddress: ''
                    }))
                    // data.name = ''
                    // data.tokenAddress = ''
                    // setData(data)
                    fetchRandomNftAndSetState(null)
                    setContractError(e)
                    setTimeout(() => {
                        onChange(getFormData())
                    }, 0);
                }
            }
            process()
        },
        300
    );

    const queryAttributes = (addr) => {
        let cachedContract = cookie.load('cachedContract') || []

        if (!cachedContract?.find(c => c === addr)) {
            fetch(nftDataApi.nft_cacheAll + "?chain_id=0x1&address=" + addr).then(r => r.json()).then(r => {
                setSyncingAttribute(true)
                cookie.save('cachedContract', JSON.stringify([...cachedContract, addr]), { path: "/" })
                fetch(nftDataApi.nft_attributes + "?chain_id=0x1&address=" + addr).then((res) => {
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
            fetch(nftDataApi.nft_attributes + "?chain_id=0x1&address=" + addr).then((res) => {
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
                bonus: bonus?.filter(b => b.value?.length) || []
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
        return <div className='MembershipCardInput'>
            <div className="maintitle" style={{ background: 'url("/imgs/membershipcardbg.png")', backgroundSize: 'cover' }}>
                <div className='text'>{pad(displayedId, 2)} {name?.length ? name : "[NFT]"}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <img src="/imgs/tick_purple.svg" alt="" className='confirmbutton tick' onClick={submit} />
                    <img src="/imgs/close_purple4.svg" alt="" className='confirmbutton' style={{ height: '24px' }} onClick={() => {
                        (ref as any).current[displayedId - 1] = null
                        onDelete(id)
                    }} />
                </div>
            </div>
            <div className="container">
                <div>
                    <Label style={{ fontWeight: 'bold', marginBottom: '12px' }}>Basic rights</Label>
                    <div style={{ marginBottom: '50px', color: '#bbb' }}>All memberships are equal</div>
                </div>
                <div className="CreateClubPageFormContainerLeft" style={{ border: 'none' }}>
                    <div className="MembershipFormGroup">
                        <div className="CreateClubPageFormGroup">
                            <Label>Ticket number per token</Label>
                            <Input id="createclubcontractinput" value={defaultWeight} disabled type="number" onChange={(e) => {
                                onChange(getFormData({ defaultWeight: e.target.value }))
                                // onChange(getFormData())
                            }} />
                        </div>
                        <div className="CreateClubPageFormGroup">
                            <Label>NFT Contract Address</Label>
                            <Input id="createclubcontractinput" value={tokenAddress || ""} className={contractError ? " error" : ''} placeholder={""}
                                onChange={(e) => {
                                    // data.tokenAddress = e.target.value
                                    // setData(data)
                                    onChange(getFormData({
                                        name: '',
                                        tokenAddress: e.target.value, editing,
                                        bonus: []
                                    }))
                                    // (getFormData())
                                    queryNft(e.target.value)
                                }} />
                            {contractError && <p className="ErrorHint">{"Contract not found"}</p>}
                        </div>
                    </div>
                </div>
                <div className="CreateClubPageFormContainerRight" style={{ border: 'none' }} >
                    <div className="MembershipFormGroup">
                        <div className="CreateClubPageFormGroup">
                            <Label>Name</Label>
                            <Input id="createclubcontractlabel" placeholder={"Obtained automatically"} maxLength={200} disabled value={name} />
                        </div>
                        <div className="CreateClubPageFormGroup">
                            <Label>Symbol</Label>
                            <Input id="createclubcontractlabel" placeholder={"Obtained automatically"} maxLength={200} disabled value={name} />
                        </div>
                    </div>
                </div>
                <div className="CreateClubPageFormContainerRighteS" style={{ paddingBottom: '32px', paddingTop: '32px', borderTop: '1px solid #dddddd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'flex-start' }}>
                        <div>
                            <Label style={{ fontWeight: 'bold', marginBottom: '12px' }}>Bonus</Label>
                            <div style={{ color: '#bbb' }}>But some are more equal than others</div>
                        </div>
                        <div className="addmorebonusbutton" onClick={() => {
                            let maxId = 0
                            bonus.forEach(b => {
                                if (b.id > maxId)
                                    maxId = b.id
                            });
                            onChange(getFormData({ bonus: [...bonus, { id: maxId + 1, weight: 1 }] }))
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
                </div>
            </div>
        </div>
    else {
        return <div className="MembershipCardPreviewCard">
            <div className="maintitle" style={{ background: 'url("/imgs/membershipcardbg.png")', backgroundSize: 'cover' }}>
                <div className='text'>{pad(displayedId, 2)} {name?.length ? name : "[NFT]"}</div>
            </div>

            <div className="maincontainer">
                {
                    imgUrl ? <div className={'sampleimagewrapper'}>
                        <NftImage defaultSrc={imgUrl} chainId={chainId} tokenId={tokenId} contract={tokenAddress} width={100}
                            className={"membershipCardImage"} />
                    </div> : null
                }
                <div className='textwrapper'>
                    <div>
                        <div className='title'>Name</div>
                        <div className='text'>{name}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <div className='title'>Contract</div>
                        <div className='text'>{tokenAddress}</div>
                    </div>
                    <div>
                        <div className='title'>Vote per NFT</div>
                        <div className='text'>{defaultWeight}</div>
                    </div>
                </div>
                <img alt="edit" title="edit" src="/imgs/write2.svg" className='editbutton' onClick={() => {
                    onEdit(id)
                }} />
            </div>
            <div className="bonuscontainer">
                {
                    bonus?.filter(b => b.value?.length)?.length ? <div className="bonustitle">Bonus</div> : null
                }
                <div className="bonuswrapper">
                    {
                        bonus?.filter(b => b.value?.length).map((b, i) => {
                            return <div className="bonusDisplayCard" key={'bonusDisplayCard' + i}>
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