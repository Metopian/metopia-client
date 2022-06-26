import React, { useState } from 'react'
import { BulletList } from 'react-content-loader'
import { useGitcoinData } from '../../../third-party/rss3'
import ProfileTable from '../module/ProfileTable'
import Reference from '../module/Reference'
import './DonationSubpage.scss'
import { customFormat } from '../../../utils/TimeUtil'
import Modal from 'react-modal';
import { WrappedLazyLoadImage } from '../../../module/image';


const DonationContentModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '1100px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '32px',
        padding: 0,
        overflow: 'hidden'
    }
}

const DonationContentModal = (props) => {
    const { isShow, hide, data } = props
    return <Modal
        size="xl"
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={hide}
        style={Object.assign({}, DonationContentModalStyle, props.style || {})}>
        <div className="donation-content-modal">
            <div className="head">
                <div className="title">Donation</div>
                <img src="/imgs/close.svg" alt="close" onClick={hide} />
            </div>
            <div className='body'>
                <div className='container'>
                    <div className='avatar-wrapper'>
                        <div className="avatar">
                            <WrappedLazyLoadImage src={data?.grant.logo} alt="" />
                        </div>
                    </div>
                </div>
                <div className='container right'>
                    <div className="group">
                        <div className='title'>Title</div>
                        <div>{data?.grant.title}</div>
                    </div>
                    <div className="group">
                        <div className='title'>Description</div>
                        <div className='description-area'>{data?.grant.description}</div>
                    </div>
                    <div className="group">
                        <div className='title'>Date</div>
                        <div>{data?.txs ? customFormat(new Date(parseInt(data.txs[0]?.timeStamp) * 1000), '#YYYY#-#MM#-#DD#') : ''}</div>
                    </div>
                    {
                        data&&data.grant.reference_url !== "https://gitcoin.co" ? <div className="group">
                            <div className='title'>Link</div>
                            <a href={data.grant.reference_url}>{data.grant.reference_url}</a>
                        </div > : null
                    }
                </div>
            </div>
        </div >
    </Modal >
}

const summarizeGitcoinData = (data) => {
    let buff = {}
    data.forEach(d => {
        if (!buff[d.detail.txs[0].symbol]) {
            buff[d.detail.txs[0].symbol] = 0
        }
        buff[d.detail.txs[0].symbol] += parseFloat(d.detail.txs[0].formatedAmount)
    })
    return Object.keys(buff).map(symbol => { return { symbol: symbol, amount: buff[symbol] } })
}
const DonationSubpage = (props) => {
    const { slug } = props
    const { data: gitcoinData } = useGitcoinData(slug)
    const [showModal, setShowModal] = useState(false)
    const [selectedDonation, setSelectedDonationData] = useState()

    return <div className="donation-subpage">
        <div className="gitcoin-container">
            <div className="head">
                <div className="gitcoin-summary-container">
                    <div className="title">Overall Gitcoin donations</div>
                    <div className="data-wrapper">
                        {gitcoinData?.length ? summarizeGitcoinData(gitcoinData).map(s => {
                            return <div className="data" key={"GitcoinSummaryData" + s}>{s.symbol} <span className='number'>{s.amount.toFixed(1)}</span></div>
                        }) : <div className='data'>None</div>}
                    </div>
                </div>
                <div className='gitcoin-reference-container'>
                    <Reference sources={[{ link: "https://rss3.io/", imgUrl: "/imgs/rss3logo.svg" }]} />
                    </div>
            </div>
            {!gitcoinData ?
                <div style={{ marginTop: '20px' }} className="no-content-container" >
                    <BulletList style={{ height: '200px' }} color="#ffffff" />
                    {/* <ReactLoading height={21} width={40} color='#333' /> */}
                </div> : (gitcoinData?.length ?
                    <div className='gitcoin-detail-container'>
                        <ProfileTable heads={['Title', 'Token/Coin', 'Amount', 'Date']}
                            data={gitcoinData.map(d => {
                                return [<div className="gitcoin-table-title-wrapper">
                                    <img src={d.detail.grant.logo} className="gitcoin-table-logo" alt="" />
                                    {d.detail.grant.title}
                                </div>,
                                d.detail.txs[0]?.symbol,
                                d.detail.txs[0]?.formatedAmount,
                                customFormat(new Date(parseInt(d.detail.txs[0]?.timeStamp) * 1000), '#YYYY#-#MM#-#DD#')
                                ]
                            })} onSelect={(i) => {
                                setSelectedDonationData(gitcoinData[i].detail)
                                setShowModal(true)
                            }} />

                    </div>
                    : <div className="no-content-container" style={{ marginTop: '20px' }}>You have not donated to any projects.</div>)
            }
            <DonationContentModal isShow={showModal} hide={() => { setShowModal(false) }} data={selectedDonation} />

        </div>
    </div>
}

export default DonationSubpage
