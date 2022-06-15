import React, { useRef, useState } from 'react'
import './TestMintPage.css'
import { MainButton } from '../module/button'
import { ImageSelector, Label, Input } from '../module/form'
import { updateImg } from '../utils/imageUtils'
import { max } from '../utils/numberUtils'
import { metopiaServer, testApi } from '../config/urls'
import { getContract, getChainId, getAddress, switchChain } from '../utils/web3Utils'

const TestMintPage = props => {
    const imageInput = useRef<HTMLInputElement | null>()
    const [image, setImage] = useState<any>()
    const [uploadedImagePath, setUploadedImagePath] = useState()
    const [attrGroup, setAttrGroup] = useState([])
    const [name, setName] = useState('')

    const getForm = () => {
        return {
            name,
            image: metopiaServer + uploadedImagePath,
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
            <ImageSelector trigger={() => { imageInput.current.click() }} imgUrl={(image && window.URL.createObjectURL(image))} />
            <input type='file' className="HiddenInput" ref={imageInput}
                onChange={async (e) => {
                    let result = await updateImg(e.target.files[0])
                    setImage(e.target.files[0])
                    setUploadedImagePath(result.content)
                    console.log(result.content)
                }}
                accept='image/*' />
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
                                console.log(attrGroup)
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
                <MainButton onClick={e => {
                    const foo = async () => {
                        let address = await getAddress()
                        if ('0x4' !== await getChainId()) {
                            await switchChain('0x4')
                        }
                        // testApi.membership_mint

                        // let metadataUri = await fetch("http://localhost:8014/metopia-api/test/membership/mint", {
                        let metadataUri = await fetch(testApi.membership_mint, {
                            method: 'POST',
                            body: JSON.stringify(getForm())

                        }).then(r => r.json())
                        console.log(metadataUri)
                        let contract = getContract("0x196bD8CC976aAbcFd72fbD53F5d3a3aC5f3831F2", require('../config/abi/MetopiaTestMembership.json').abi)
                        contract.mint()
                        console.log("?")
                    }
                    foo()
                    // console.log(getForm())
                }}>Mint</MainButton>
            </div>
        </div>
    </div>
}

export default TestMintPage