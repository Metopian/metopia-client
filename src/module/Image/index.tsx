import React, { useState, useEffect } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { nftDataApi } from '../../config/urls'
import useSWR from "swr";
import ReactLoading from 'react-loading';
import './index.css'

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

    if (!image || !image.src || image.src.length === 0)
        return null
    let src = image.src
    if (image.src.indexOf("ipfs://") === 0) {
        src = "https://metopia.mypinata.cloud/ipfs/" + image.src.substring(7, image.src.length)
    }

    return (
        <div className={'WrappedLazyLoadImage ' + (image.className ? image.className : '')}>
            <LazyLoadImage
                beforeLoad={() => setLoading(true)}
                afterLoad={() => setLoading(false)}
                alt={image.alt || ''}
                src={loadDefault ? image.defaultSrc : src}
                onError={(e) => {
                    if (loadDefault || !image.defaultSrc) {
                        e.target.src = "/imgs/imgplaceholder.svg"
                        e.target.title = "The image is not loaded correcly"
                    } else {
                        setLoadDefault(true)
                    }
                }}
            />
            {
                loading ? <ReactLoading type={'spin'} color={'#444'} height={'20%'} width={'20%'} className="loading" /> : null
            }
        </div>
    )
}

const fetcher = (chainId, contract, tokenId, width) => {
    return fetch(nftDataApi.nft_image + '?address=' + contract + "&token_id=" + tokenId + (width ? "&width=" + width : "")).then((res) => res.json())
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
    }, [cachedUrlData])

    return <WrappedLazyLoadImage alt={""} src={url} className={className} defaultSrc={defaultSrc} />
}

export { WrappedLazyLoadImage, NftImage }
export * from './DefaultAvatar'