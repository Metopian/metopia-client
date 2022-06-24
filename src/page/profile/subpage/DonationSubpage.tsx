import React from 'react'
import { useGitcoinData } from '../../../third-party/rss3'
import './DonationSubpage.scss'
import Reference from '../module/Reference'
import ProfileTable from '../module/ProfileTable'

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
                    <Reference sources={[{ link: "https://rss3.io/", imgUrl: "/imgs/rss3logo.svg" }]} /></div>

            </div>
            {gitcoinData?.length ?
                <div className='gitcoin-detail-container'>

                    <ProfileTable heads={['Title', 'Token/Coin', 'Amount']}
                        data={gitcoinData.map(d => {
                            return [<div className="GitcoinDataTitleWrapper">
                                <img src={d.detail.grant.logo} className="GitcoinDataLogo" alt="" />
                                {d.detail.grant.title}
                            </div>,
                            d.detail.txs[0].symbol,
                            d.detail.txs[0].formatedAmount
                            ]
                        })} />
                    
                </div>
                : null}
        </div>
    </div>
}

export default DonationSubpage
