import React, { useEffect } from 'react'
import './DonationSubpage.css'
import { getGitcoinData, useGitcoinData } from '../../../third-party/rss3'

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
    return <div className="DonationSubpage">
        <div className="GitcoinSummary">
            <div className="GitcoinSummaryTitle">Overall Gitcoin donations:</div>
            {gitcoinData && summarizeGitcoinData(gitcoinData).map(s => {
                return <div className="GitcoinSummaryData" key={"GitcoinSummaryData" + s}>{s.symbol} - {s.amount.toFixed(1)}</div>
            })}
        </div>
        <table className="GitcoinTable">
            <tr>
                {/* <th></th> */}
                <th>Title</th>
                <th>Token/Coin</th>
                <th>Amount</th>
            </tr>
            {gitcoinData && gitcoinData.map(d => {
                return <tr className="GitcoinDataWrapper" key={'gitcoindata' + d.id}>
                    {/* <td></td> */}
                    <td><div className="GitcoinDataTitleWrapper"><img src={d.detail.grant.logo} className="GitcoinDataLogo" />{d.detail.grant.title}</div></td>
                    {/* <td>{d.detail.grant.description}</td> */}
                    <td>{d.detail.txs[0].symbol}</td>
                    <td>{d.detail.txs[0].formatedAmount}</td>
                </tr>
            })}
        </table>
        <div className="DonationSubpageFooter">
            <div className="DonationSubpageFooterTitle">Data source:</div>
            <a href="https://rss3.io/"><img src="/imgs/rss3logo.svg" /></a>
        </div>
    </div>
}

export default DonationSubpage