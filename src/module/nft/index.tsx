import React, { useEffect, useMemo, useState } from 'react'
import FlexibleOrderedContainer from '../../module/FlexibleOrderedContainer'
import { getNFTReadableSrc, nftEqual } from '../../utils/NftUtils'
import './index.scss'
import NftOptionCard from './NftOptionCard'

const NftCollectionNameButton = (props) => {
    return <div className={"nft-collection-name-button" + (props.selected ? " selected" : '')} onClick={() => {
        props.onClick && props.onClick(!props.selected)
    }}>{props.children}</div>
}

const NftSelectionPane = (props: { sortedNfts, onSelect?, minWidth?, maxWidth?, gap?, noTick?}) => {
    const { sortedNfts, onSelect, minWidth, maxWidth, gap, noTick } = props
    const [selectedNft, setSelectedNft] = useState(null)
    const [selectedContracts, setselectedContracts] = useState([])

    useEffect(() => {
        if (sortedNfts?.length && selectedContracts.length === 0) {
            setselectedContracts(['1', sortedNfts[0].tokenAddress])
        }
    }, [sortedNfts, selectedContracts])

    const cards = useMemo(() => {
        let arr = []
        sortedNfts?.forEach(nftGroup => {
            if (!selectedContracts.find(i => i === nftGroup.tokenAddress))
                return null
            return nftGroup.data.forEach((nft, j) => {
                if (!nft.metadata)
                    return
                let src = getNFTReadableSrc(nft)
                if (!src || src.length === 0) return
                arr.push(<NftOptionCard tokenAddress={nft.token_address} tokenId={nft.token_id} selected={nftEqual(selectedNft, nft)}
                    size={minWidth && maxWidth ? [minWidth, maxWidth] : [90, 120]}
                    key={'NftOptionCard-' + (nft.token_id || j) + "-" + nft.token_address}
                    src={src} noTick={noTick}
                    onClick={(e) => {
                        if (nftEqual(selectedNft, nft)) {
                            setSelectedNft(null)
                        } else {
                            setSelectedNft(nft)
                        }
                        onSelect && onSelect(nft)
                    }} />
                )
            })
        })
        return arr
    }, [sortedNfts, onSelect, minWidth, maxWidth, noTick, selectedContracts, selectedNft])

    return <div className="nft-selection-pane">
        <div className='nft-collection-name-button-container'>
            {sortedNfts?.map((nftGroup, i) => {
                return <NftCollectionNameButton key={'nftGroup--' + i} selected={selectedContracts.find(c => c === nftGroup.tokenAddress)}
                    onClick={() => {
                        let tmp = selectedContracts.map(i => i)
                        if (!tmp.find(c => c === nftGroup.tokenAddress)) {
                            tmp.push(nftGroup.tokenAddress)
                        } else {
                            tmp = tmp.filter(t => t !== nftGroup.tokenAddress)
                        }

                        setselectedContracts(tmp)
                    }}>{nftGroup.name}({nftGroup.data.length})</NftCollectionNameButton>
            })
            }
        </div>
        <FlexibleOrderedContainer elementMinWidth={props.minWidth || 90} elementMaxWidth={props.maxWidth || 90} gap={props.gap || 10} style={{ marginTop: '10px' }} >
            {cards}
        </FlexibleOrderedContainer>
    </div>
}


export { NftSelectionPane, NftOptionCard, NftCollectionNameButton }
