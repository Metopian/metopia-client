import React, { useState } from 'react'
import { MainButton } from '../module/button'
import { ImageSelector, Input, Label } from '../module/form'
import { uploadFileToIfps } from '../utils/ipfsUtils'
import { max } from '../utils/numberUtils'
import { getAddress, getChainId, getContract, getProvider, switchChain } from '../utils/web3Utils'
import './TestMintPage.css'
import { utils } from 'ethers'
import { nftDataApi } from '../config/urls'
const TestMintPage = props => {
    const [image, setImage] = useState<any>()
    const [uploadedImagePath, setUploadedImagePath] = useState<any>()
    const [attrGroup, setAttrGroup] = useState([])
    const [name, setName] = useState('')
    const [txConfirming, setTxConfirming] = useState(false)

    const getForm = () => {
        return {
            name,
            image: uploadedImagePath,
            description: "Metopia test membership card",
            attributes: attrGroup.filter(a => a.field?.length && a.value?.length).map(a => {
                return { trait_type: a.field, value: a.value }
            })
        }
    }

    return <div className="TestMintPage">
        <div className='title'>Mint your test membership card at Rinkeby</div>

        <div className="form">
            <Label>Upload your image</Label>
            <ImageSelector imgUrl={(image && window.URL.createObjectURL(image))}
                onChange={async (e) => {
                    let result = await uploadFileToIfps(e.target.files[0])
                    if (!result.IpfsHash) {
                        window.alert("Image upload failed. Please check your network.")
                        return
                    }
                    setImage(e.target.files[0])
                    setUploadedImagePath("ipfs://" + result.IpfsHash)
                }}
            />
            <div style={{ height: '20px' }}></div>
            <Label>Name</Label>
            <Input placeholder="name" onChange={e => setName(e.target.value)} />
            <div style={{ height: '40px' }}></div>
            <Label>Attributes</Label>
            <div className="attributecontainer">
                {
                    attrGroup.map((attr, i) => {
                        return <div className='group' key={'group' + i}>
                            <img src="/imgs/close.svg" alt="del" className='closebutton' onClick={e => {
                                setAttrGroup(attrGroup.filter(a => a.id !== attr.id))
                            }} />
                            <Label>Field</Label>
                            <Input placeholder="field" onChange={e => {
                                setAttrGroup(attrGroup.map(a => {
                                    if (a.id === attr.id) {
                                        return Object.assign({}, a, { field: e.target.value })
                                    } else {
                                        return a
                                    }
                                }))
                            }} />
                            <Label>Value</Label>
                            <Input placeholder="value" onChange={e => {
                                setAttrGroup(attrGroup.map(a => {
                                    if (a.id === attr.id) {
                                        return Object.assign({}, a, { value: e.target.value })
                                    } else {
                                        return a
                                    }
                                }))
                            }} />
                        </div>
                    })
                }

                <MainButton onClick={() => {
                    setAttrGroup([...attrGroup, { id: max(attrGroup, 'id') + 1, field: '', value: '' }])
                }}>Add attribute</MainButton>
            </div>

            <div style={{ marginTop: '40px' }}>
                <MainButton loading={txConfirming} onClick={async (e) => {
                    let contract = getContract("0x196bD8CC976aAbcFd72fbD53F5d3a3aC5f3831F2",
                        require('../config/abi/MetopiaTestMembership.json').abi, getProvider().getSigner())
                    let address = await getAddress()
                    if ('0x4' !== await getChainId()) {
                        await switchChain('0x4')
                    }
                    var blob = new Blob([JSON.stringify(getForm())], { type: 'text/plain' });
                    var file = new File([blob], "metadata", { type: "text/plain" });

                    let result = await uploadFileToIfps(file)
                    if (!result.IpfsHash) {
                        window.alert("Image upload failed. Please check your network.")
                        return
                    }
                    let ipfsLink = "ipfs://" + result.IpfsHash

                    const filter = {
                        address: "0x196bD8CC976aAbcFd72fbD53F5d3a3aC5f3831F2",
                        topics: [
                            utils.id("Transfer(address,address,uint256)")
                        ]
                    }

                    getProvider().on(filter, (d) => {
                        fetch(nftDataApi.nft_cacheAll + "?chain_id=0x4&address=0x196bD8CC976aAbcFd72fbD53F5d3a3aC5f3831F2").then(r => r.json()).then(d => {
                            setTxConfirming(false)
                        })
                    })

                    await contract.mint(ipfsLink)

                    setTxConfirming(true)
                }}>Mint</MainButton>
            </div>
        </div>
    </div >
}

export default TestMintPage