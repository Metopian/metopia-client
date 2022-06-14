import React, { useState, useMemo, useEffect } from 'react'
import NftOptionCard from './NftOptionCard'
import NftCollectionNameButton, { NftCollectionNameButtonV2 } from './NftCollectionNameButton'
import FlexibleOrderedContainer from '../../module/FlexibleOrderedContainer'
import { getNFTReadableSrc, nftFind, nftEqual, getSortedNfts } from '../../utils/NftUtils'

const NftSelectionPane = (props: { sortedNfts, onSelect?, minWidth?, maxWidth?, gap?, noTick?}) => {
    const [selectedNft, setSelectedNft] = useState(null)
    const [selectedContracts, setselectedContracts] = useState([])

    useEffect(() => {
        if (props.sortedNfts && props.sortedNfts.length > 0 && selectedContracts.length === 0) {
            setselectedContracts(['1', props.sortedNfts[0].tokenAddress])
        }
    }, [props.sortedNfts, selectedContracts])

    const cards = useMemo(() => {
        let arr = []
        props.sortedNfts && props.sortedNfts.forEach(nftGroup => {
            if (!selectedContracts.find(i => i === nftGroup.tokenAddress))
                return null
            return nftGroup.data.forEach((nft, j) => {
                if (!nft.metadata)
                    return
                let src = getNFTReadableSrc(nft)
                if (!src || src.length === 0) return
                arr.push(<NftOptionCard tokenAddress={nft.token_address} tokenId={nft.token_id} selected={nftEqual(selectedNft, nft)} size={props.minWidth && props.maxWidth ? [props.minWidth, props.maxWidth] : [90, 120]}
                    key={'NftOptionCard-' + (nft.token_id || j) + "-" + nft.token_address}
                    src={src} noTick={props.noTick}
                    onClick={(e) => {
                        if (nftEqual(selectedNft, nft)) {
                            setSelectedNft(null)
                        } else {
                            setSelectedNft(nft)
                        }
                        props.onSelect && props.onSelect(nft)
                    }} />
                )
            })
        })
        return arr
    }, [props.sortedNfts, selectedContracts, props.minWidth, props.maxWidth, selectedNft])

    return <div className="">
        <div className='NftCollectionNameButtonContainer'>
            {props.sortedNfts && props.sortedNfts.map((nftGroup, i) => {
                return <NftCollectionNameButtonV2 key={'nftGroup--' + i} selected={selectedContracts.find(c => c === nftGroup.tokenAddress)}
                    onClick={() => {
                        let tmp = selectedContracts.map(i => i)
                        if (!tmp.find(c => c === nftGroup.tokenAddress)) {
                            tmp.push(nftGroup.tokenAddress)
                        } else {
                            tmp = tmp.filter(t => t !== nftGroup.tokenAddress)
                        }

                        setselectedContracts(tmp)
                    }}>{nftGroup.name}({nftGroup.data.length})</NftCollectionNameButtonV2>
            })
            }
        </div>
        <FlexibleOrderedContainer elementMinWidth={props.minWidth || 90} elementMaxWidth={props.maxWidth || 90} gap={props.gap || 10} style={{ marginTop: '10px' }} >
            {cards}
        </FlexibleOrderedContainer>
    </div>
}


export { NftSelectionPane, NftOptionCard, NftCollectionNameButton, NftCollectionNameButtonV2 }