import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import parse from 'html-react-parser';
import React, { useEffect, useMemo, useState } from 'react';
import ReactLoading from 'react-loading';
import { loadSnapshotVotesByProposal } from '../../../config/graphql';
import { domain, Vote, vote2Types } from '../../../config/snapshotConfig';
import { localRouter, ossImageThumbnailPrefix, snapshotApi } from '../../../config/urls';
import { useAccountListData } from '../../../core/account';
import { useProposal, useScoreData } from '../../../core/governance';
import { MainButton } from '../../../module/button';
import { DefaultAvatarWithRoundBackground, WrappedLazyLoadImage } from '../../../module/image';
import { sum, toFixedIfNecessary } from '../../../utils/numberUtils';
import { addrShorten, compareIgnoringCase } from '../../../utils/stringUtils';
import { customFormat, getDateDiff } from '../../../utils/TimeUtil';
import { getAddress, getEns, getProvider } from '../../../utils/web3Utils';
import './index.scss';

const getRealVoteCount = (vote: number) => {
    let base = 100
    return toFixedIfNecessary(vote / base, 1)
}

const signTypedData = async (web3: Web3Provider | Wallet, address: string, message, types) => {
    // @ts-ignore
    const signer = web3?.getSigner ? web3.getSigner() : web3;
    if (!message.from) message.from = address;
    if (!message.timestamp)
        message.timestamp = parseInt((Date.now() / 1e3).toFixed());
    const data: any = { domain, types, message };
    const sig = await signer._signTypedData(domain, data.types, message);
    return { address, sig, data }
}

const vote = async (web3: Web3Provider | Wallet, address: string, message: Vote) => {
    return await signTypedData(web3, address, message, vote2Types);
}

const ProposalHomePage = props => {
    const { id } = props
    const { data: proposal } = useProposal(id)
    const [votes, setVotes] = useState([])
    const [selectedOptionId, setSelectedOptionId] = useState(-1)
    const [voting, setVoting] = useState(false)
    const [self, setSelf] = useState(null)
    const [authorEns, setAuthorEns] = useState(null)

    const getAddressToCalcScore = useMemo(() => {
        let res = []
        self && res.push(self)
        votes?.forEach(v => {
            if (!res.includes(v.voter)) {
                res.push(v.voter)
            }
        })
        return res
    }, [self, votes])

    const { data: scores } = useScoreData(id, proposal?.network, proposal?.snapshot, proposal?.strategies, getAddressToCalcScore)

    const { data: accounts } = useAccountListData(getAddressToCalcScore)

    useEffect(() => {
        getAddress().then(addr => {
            setSelf(addr)
        })
    }, [])

    useEffect(() => {
        if (proposal?.author) {
            (async () => {
                const ens = await getEns(proposal.author)
                if (ens?.length)
                    setAuthorEns(ens)
            })()
        }
    }, [proposal])


    const doVote = () => {
        if (!self) {
            getAddress().then(addr => setSelf(addr))
        }
        if (!scoresObj[self])
            return
        setVoting(true)
        getAddress().then(async (addr) => {
            let res = await vote(getProvider(), addr, {
                "space": proposal.space?.id,
                "proposal": id,
                "choice": selectedOptionId,
                "metadata": "{}",
                "from": addr,
                "timestamp": parseInt(new Date().getTime() / 1000 + ''),
            })
            fetch(snapshotApi.msg, {
                method: "POST",
                body: JSON.stringify(res),
                headers: {
                    "content-type": "application/json",
                    "Accept": "application/json"
                }
            }).then(r => r.json()).then((r) => {
                if (!r.error) {
                    window.location.reload()
                } else {
                    if (r.error === 'unauthorized') {

                    }
                    console.error(r.error)
                    alert("Failed")
                }
            }).catch(e => {
                alert("Failed")
            }).finally(() => {
                setVoting(false)
            })
        }).catch((e) => {
            setVoting(false)
            throw e
        })
    }


    useEffect(() => {
        const initVotes = () => {
            return fetch(snapshotApi.graphql, {
                method: 'POST',
                body: JSON.stringify(loadSnapshotVotesByProposal(id)),
                headers: {
                    'content-type': "application/json"
                }
            }).then(d => d.json()).then(d => {
                setVotes(d.data.votes)
            })
        }

        initVotes()
    }, [id])


    const scoresObj = useMemo(() => {
        if (scores?.result?.scores) {
            let scoreTmp = {}
            scores.result.scores.forEach(s => {
                Object.keys(s).forEach(key => scoreTmp[key] = s[key])
            })
            return scoreTmp
        } else {
            return {}
        }
    }, [scores])

    const voteSum = useMemo(() => {
        let res = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        if (scores?.result?.scores) {
            scores.result.scores.forEach((s, i) => {
                Object.keys(s).forEach(addr => {
                    votes.forEach((v) => {
                        if (v.voter === addr) {
                            res[v.choice - 1] += s[addr]
                        }
                    })
                })
            })
        }
        return res
    }, [scores, votes])

    let mychoice = -1
    if (self) {
        if (votes && self) {
            votes.forEach((v) => {
                if (self.toLowerCase() === v.voter.toLowerCase()) {
                    mychoice = v.choice - 1
                }
            })
        }
    }

    const selfAccount = accounts?.data?.list?.find(acc => compareIgnoringCase(acc.owner, proposal?.author))
    return <div className="proposal-index-page">
        <div className="title"><img src="/imgs/arrow-left.svg" className="backarrow" alt="back" onClick={() => {
            window.location.href = localRouter("dao.prefix") + (proposal.space?.id)
        }} />Voting</div>
        <div className='container'>
            <div className="left-container">
                <div className="main-container">
                    <div className="author-container">
                        <a href={`${localRouter('profile')}${proposal?.author}`}>
                            {
                                selfAccount?.avatar ?
                                    <WrappedLazyLoadImage className="avatar" alt="" src={selfAccount.avatar + ossImageThumbnailPrefix(40, 40)} /> :
                                    <DefaultAvatarWithRoundBackground wallet={proposal?.author} className="avatar" />
                            }
                            {/* <DefaultAvatarWithRoundBackground wallet={proposal?.author} className="avatar" /> */}

                            <div className="name">{selfAccount?.username || authorEns}</div>
                            <div className="address">{addrShorten(proposal?.author)}</div>
                        </a>
                    </div>
                    <div className="title">{proposal?.title}</div>
                    <div className="body">{proposal?.body && parse(proposal.body)}</div>
                </div>
            </div>
            <div className="right-container">
                <div className="voting-container">
                    <div className='head'>
                        <div className='title'>Voting</div>
                        <div className="top">{(() => {
                            if (!proposal) return ""
                            if (proposal.state === 'closed')
                                return 'Closed'
                            if (proposal.state === 'active')
                                return getDateDiff(proposal.end * 1000, true) + ' left'
                            else
                                return getDateDiff(proposal.start * 1000, true) + " to go"
                        })()}</div>
                    </div>
                    <div className="time">
                        {proposal?.start ? customFormat(new Date(proposal.start * 1000), ("#YYYY#-#MM#-#DD# #hhhh#:#mm#")) : ''}&nbsp;-&nbsp;
                        {proposal?.end ? customFormat(new Date(proposal.end * 1000), ("#YYYY#-#MM#-#DD# #hhhh#:#mm#")) : ''}
                    </div>
                    <div className='choice-option-wrapper'>
                        {
                            proposal?.choices.map((c, i) => {
                                return <div key={`choice-option-${i}`}
                                    className={'choice-option ' + (selectedOptionId === i + 1 || mychoice === i ? 'selected' : '') + (mychoice > -1 || proposal?.state === 'closed' ? ' disabled' : '')}
                                    onClick={() => {
                                        if (mychoice > -1 || proposal?.state === 'closed')
                                            return
                                        if (selectedOptionId === i + 1)
                                            setSelectedOptionId(-1)
                                        else
                                            setSelectedOptionId(i + 1)
                                    }}>
                                    <div className="bg" style={{ width: voteSum[i] / sum(voteSum) * 100 + "%" }}></div>
                                    <div className="container">
                                        <div className="title">{c}{mychoice === i ? <div className='tick'>√</div> : ''}</div>
                                        <div>{toFixedIfNecessary(voteSum[i] / (sum(voteSum) || 1) * 100, 2)}%</div>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                    {
                        mychoice === -1 && proposal?.state === 'active' ? <MainButton
                            className={'choice-option-button ' + (scoresObj[self] ? "" : " disabled")}
                            onClick={doVote}>
                            {scoresObj[self] ? "Cast " + getRealVoteCount(scoresObj[self]) + " Vote" : "You can't vote"}
                            {voting ? <ReactLoading type='spokes' height={20} width={20} className="loading" /> : null}
                        </MainButton> : null
                    }
                </div>

                <div className="result-container" >
                    <div className='head'>
                        <div className="title">{proposal?.state === 'closed' ? "Result" : "Current result"}</div>
                        <div className='number-wrapper'>Total: <span className="number">{getRealVoteCount(sum(voteSum))}</span></div>
                    </div>
                    <div className='main-container'>
                        {
                            votes?.length ? <div>
                                {
                                    votes.map((v, i) => {
                                        const account = accounts?.data?.list?.find(acc => compareIgnoringCase(acc.owner, v.voter))
                                        return <div key={"vote-card" + i} className="vote-card">
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                {
                                                    account?.avatar ?
                                                        <WrappedLazyLoadImage className="avatar" alt="" src={account.avatar + ossImageThumbnailPrefix(40, 40)} /> :
                                                        <DefaultAvatarWithRoundBackground wallet={v.voter} className="avatar" />
                                                }
                                                <div className='name'><a href={`${localRouter('profile')}${v.voter}`}>{account?.username || addrShorten(v.voter)}</a></div>
                                            </div>
                                            <div>{proposal?.choices.filter((t, i) => i + 1 === v.choice)}</div>
                                            <div className="number-wrapper">{getRealVoteCount(scoresObj[v.voter])} vote(s)</div>
                                        </div>
                                    })
                                }
                            </div> :
                                <div style={{ color: '#888' }}>There is no voting data.</div>
                        }
                    </div>
                </div>
            </div>
        </div>
        {
            // proposal
        }
    </div>
}

export default ProposalHomePage