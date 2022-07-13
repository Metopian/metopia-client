import React, { useState, useEffect, useMemo } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { nftDataApi } from '../../config/urls'
import useSWR from "swr";
import ReactLoading from 'react-loading';
import './index.scss'

interface LazyLoadImageParam {
    src: string;
    alt?: string;
    className?: string;
    defaultSrc?: string
}

interface NftImageParam {
    defaultSrc: string;
    chainId: string;
    contract: string;
    tokenId: number;
    width: number;
    className?: string;
}

const WrappedLazyLoadImage = (image: LazyLoadImageParam) => {

    const [loadDefault, setLoadDefault] = useState(false)
    const [loading, setLoading] = useState(true)

    const imgComponent = useMemo(() => {
        console.log(image.src)
        return <LazyLoadImage
            beforeLoad={() => setLoading(true)}
            afterLoad={() => setLoading(false)}
            alt={image.alt || ''}
            src={loadDefault ? image.defaultSrc : image.src}
            onError={(e) => {
                if (loadDefault || !image.defaultSrc) {
                    e.target.src = "/imgs/imgplaceholder.svg"
                    e.target.title = "The image is not loaded correcly"
                } else {
                    setLoadDefault(true)
                }
            }}
        />
    }, [image.src, image.alt, image.defaultSrc, loadDefault])

    if (!image.src?.length)
        return null
    let src = image.src
    if (image.src.indexOf("ipfs://") === 0) {
        src = "https://metopia.mypinata.cloud/ipfs/" + image.src.substring(7, image.src.length)
    }

    return (
        <div className={'wrapped-lazy-load-image ' + (image.className ? image.className : '')}>
            {imgComponent}
            {
                loading ? <ReactLoading type={'spin'} color={'#444'} height={'20%'} width={'20%'} className="loading" /> : null
            }
        </div>
    )
}

const fetcher = (chainId, contract, tokenId, width) => {
    return fetch(nftDataApi.nft_image + '?chain_id=' + chainId + '&address=' + contract + "&token_id=" + tokenId + (width ? "&width=" + width : "")).then((res) => res.json())
}

const NftImage = (props: NftImageParam) => {
    const { defaultSrc, chainId, contract, tokenId, width, className } = props
    const [url, setUrl] = useState(defaultSrc)
    const [refreshFlag, setRefreshFlag] = useState(false)
    const { data: cachedUrlData } = useSWR(contract && tokenId ? [chainId, contract, tokenId, width, refreshFlag] : null, fetcher)

    useEffect(() => {
        if (cachedUrlData) {
            if (cachedUrlData.code === 90 && cachedUrlData.msg === "NFT not found") {
                fetch(nftDataApi.nft_cache + '?address=' + contract + "&token_id=" + tokenId).then((res) => res.json()).then(res => {
                    setRefreshFlag(true)
                })
            }
            else {
                let src = cachedUrlData.data.image
                if (src)
                    setUrl(src)
            }
        }
    }, [cachedUrlData, contract, tokenId])

    return <WrappedLazyLoadImage alt={""} src={url} className={className} defaultSrc={defaultSrc} />
}

export { WrappedLazyLoadImage, NftImage }
export * from './DefaultAvatar'