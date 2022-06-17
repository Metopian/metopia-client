import React, { useMemo, useState } from 'react';
import { BulletList } from 'react-content-loader';
import Modal from 'react-modal';
import { chainExplorerMap, chainMap } from '../../../config/constant';
import { useChainId } from '../../../config/store';
// import ReactLoading from 'react-loading'
import { NftImage } from '../../../module/image';
import { NftSelectionPane } from '../../../module/nft';
import { useNfts, useNftTransactions } from '../../../third-party/moralis';
import { getSortedNfts } from '../../../utils/NftUtils';
import { addrShorten, capitalizeFirstLetter } from '../../../utils/stringUtils';
import { getDateDiff } from '../../../utils/TimeUtil';
import './NFTSubpage.css';

const PoapContentModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '720px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '32px',
        padding: 0,
        overflow: 'hidden',
    }
}

const formatDate = function (date, fmt) { //author: meizz 
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

const NftContentModal = (props) => {
    const { isShow, hide, data, acquiredTx } = props
    const metadata = data.metadata ? JSON.parse(data.metadata) : {}
    const {chainId} = useChainId()
    return <Modal
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={hide}
        style={Object.assign({}, PoapContentModalStyle, { width: metadata.attributes && metadata.attributes.length > 0 ? '720px' : '540px' })}>
        <div className="NftContentModalContainer">
            <div className="NftContentModalGroup">
                <div className={"NftContentModalImageWrapper" + (metadata.attributes && metadata.attributes.length > 0 ? ' narrow' : '')}>
                    <NftImage defaultSrc={metadata.image || metadata.image_url} width={null}
                        chainId={chainId} tokenId={data.token_id} contract={data.token_address} />
                    {/* <img src={metadata.image} alt="" /> */}
                </div>
                {
                    (metadata.attributes && metadata.attributes.length > 0) ?
                        <div className="NftContentModalAttributesContainer">
                            {/* <div className='NftContentTitle'>Attributes</div> */}
                            <div className="NftContentModalAttributesGroupWrapper">
                                {metadata.attributes.map((attr, i) => {
                                    return <div className='NftContentModalAttributeGroup' key={"NftContentModalAttributeGroup" + i}>
                                        <div className="title">{capitalizeFirstLetter(attr.trait_type)}</div>
                                        <div className="value">{attr.value}</div>
                                    </div>
                                })
                                }
                            </div>
                        </div> : null
                }
            </div>
            <div className="NftContentModalGroup">
                <div className='NftContentTitle'>Name</div>
                <div>{data.name}</div>
            </div>
            <div className="NftContentModalGroup">
                <div className='NftContentTitle'>Chain</div>
                <div>{chainMap[data.chainId]}</div>
                <div className='NftContentTitle' style={{ width: '60px', minWidth: '60px', marginLeft: '40px' }}>Contract</div>
                <div style={{ marginLeft: '10px' }}><a href={chainExplorerMap[data.chainId] + data.token_address}>{addrShorten(data.token_address)}</a></div>
                <div className='NftContentTitle' style={{ width: '60px', minWidth: '60px', marginLeft: '40px' }}>Token-Id</div>
                <div style={{ marginLeft: '10px' }}>{data.token_id}</div>
            </div>
            {
                metadata.description ? <div className="NftContentModalGroup">
                    <div className='NftContentTitle'>Description</div>
                    <div>{metadata.description}</div>
                </div> : null
            }
            {
                metadata.external_url ? <div className="NftContentModalGroup">
                    <div className='NftContentTitle'>Link</div>
                    <a href={metadata.external_url}>{metadata.external_url}</a>
                </div > : null
            }
            <div className="NftContentModalGroup">
                <div className='NftContentTitle'>Hold since</div>
                <div>{acquiredTx && getDateDiff(new Date(acquiredTx.block_timestamp))}</div>
            </div>
            <div className="NftContentModalGroup openseawrapper">
                <a href={`https://opensea.io/assets/${data.token_address}/${data.token_id}`}><img src="/imgs/opensea.svg" alt="" />View on Opensea</a>
            </div>

        </div >
    </Modal >
}

const NFTSubpage = (props) => {
    const { slug } = props
    const {chainId} = useChainId()
    const { data: ethNfts } = useNfts(slug, chainId)
    const [selectedNftData, setSelectedNftData] = useState<any>({})
    const [showModal, setShowModal] = useState(false)
    const { data: nftTransactions } = useNftTransactions(slug, chainId)

    const sortedNfts = useMemo(() => {
        if (!ethNfts)
            return []

        let nftList = []
        if (ethNfts) {
            nftList.push(...(ethNfts.result.filter(item => item.metadata).map(item => {
                return Object.assign({}, item, { chainId: chainId })
            })))
        }

        return getSortedNfts(nftList)
    }, [ethNfts])

    let lastPurchasedTx = useMemo(() => {
        if (!selectedNftData.token_id)
            return null
        let res = null
        nftTransactions.result.forEach(tx => {
            if (tx.token_id === selectedNftData.token_id && tx.token_address === selectedNftData.token_address && tx.to_address.toLowerCase() === slug.toLowerCase()) {
                if (res) {
                    if (parseFloat(res.block_number) < parseFloat(tx.block_number)) {
                        res = tx
                    }
                } else {
                    res = tx
                }
            }
        })
        return res
    }, [nftTransactions, selectedNftData])

    if (sortedNfts) {
        if (sortedNfts.length)
            return <div>
                <NftSelectionPane noTick sortedNfts={sortedNfts} maxWidth={160} minWidth={120} onSelect={(nft) => {
                    setSelectedNftData(nft)
                    setShowModal(true)
                }} />
                <NftContentModal isShow={showModal} hide={() => { setShowModal(false) }} data={selectedNftData} acquiredTx={lastPurchasedTx} />
            </div>
        else {
            return <div style={{ fontSize: '18px', marginTop: '20px' }}>You have not collected any NFTs.</div>
        }
    } else return <div style={{ marginTop: '20px' }}>
        <BulletList style={{ height: '200px' }} />
        {/* <ReactLoading height={21} width={40} color='#333' /> */}
    </div>
}

export default NFTSubpage 