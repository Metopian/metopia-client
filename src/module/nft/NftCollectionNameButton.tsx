import React, { useState } from 'react'
import './NftCollectionNameButton.css'

const NftCollectionNameButton = (props) => {
    const [selected, setSelected] = useState(true)
    return <div className={"NftCollectionNameButton" + (selected ? " selected" : '')} onClick={() => {
        setSelected(!selected)
        props.onClick && props.onClick(!selected)
    }}>{props.children}</div>
}

const NftCollectionNameButtonV2 = (props) => {
    return <div className={"NftCollectionNameButton" + (props.selected ? " selected" : '')} onClick={() => {
        props.onClick && props.onClick(!props.selected)
    }}>{props.children}</div>
}
export default NftCollectionNameButton
export { NftCollectionNameButtonV2 }
