import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import parse from 'html-react-parser';
import React, { useEffect, useMemo, useState } from 'react';
import ReactLoading from 'react-loading';
import { loadSnapshotVotesByProposal, loadSnapshotVotesByProposalWhereChoice } from '../../../config/graphql';
import { domain, Vote, vote2Types } from '../../../config/snapshotConfig';
import { localRouter, ossImageThumbnailPrefix, snapshotApi } from '../../../config/urls';
import { useAccountListData } from '../../../core/account';
import { useProposal, useScoreData } from '../../../core/governance';
import { MainButton, SingleChoiceButtonGroup } from '../../../module/button';
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
    const [selectedChoiceId, setSelectedChoiceId] = useState(-1)
    const [proposalScores, setProposalScores] = useState(null)
    const [myVote, setMyVote] = useState(null)

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
                    return '200'
                    // window.location.reload()
                } else {
                    if (r.error === 'unauthorized') {

                    }
                    console.error(r.error)
                    alert("Failed")
                }
            }).then(d => {
                setVotes([...votes, { voter: self, choice: selectedOptionId }])
                fetch(snapshotApi.proposal_scores + id).then(d => {
                    return d.json()
                }).then(d => {
                    setProposalScores(d.scores)
                })
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
                body: selectedChoiceId === -1 ? JSON.stringify(loadSnapshotVotesByProposal(id)) :
                    JSON.stringify(loadSnapshotVotesByProposalWhereChoice(id, selectedChoiceId + 1, self)),
                headers: {
                    'content-type': "application/json"
                }
            }).then(d => d.json()).then(d => {
                setVotes(d.data.votes)
                if (d.data.self) {
                    setMyVote(d.data.self[0])
                }
            })
        }

        initVotes()
    }, [id, self, selectedChoiceId])

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

    let mychoice = -1
    if (self) {
        if (votes && self) {
            votes.forEach((v) => {
                if (self.toLowerCase() === v.voter.toLowerCase()) {
                    mychoice = v.choice - 1
                }
            })
            if (myVote) mychoice = myVote.choice - 1
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
                            if (proposal.state === 'active') {
                                if (getDateDiff(proposal.end * 1000, true) === 'Now') {
                                    return 'Closing'
                                } else {
                                    return getDateDiff(proposal.end * 1000, true) + ' left'
                                }
                            }
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
                                    <div className="bg" style={{ width: (proposalScores || proposal.scores)[i] / sum((proposalScores || proposal.scores)) * 100 + "%" }}></div>
                                    <div className="container">
                                        <div className="title">{c}{mychoice === i ? <div className='tick'>√</div> : ''}</div>
                                        <div>{toFixedIfNecessary((proposalScores || proposal.scores || [0])[i] / sum((proposalScores || proposal.scores)) * 100, 2)}%</div>
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
                        <div className="title">{proposal?.state === 'closed' ? "Voter summary" : "Current stats"}</div>
                        <div className='number-wrapper'>
                            {selectedChoiceId > -1 ? (proposal?.choices)[selectedChoiceId] : "Total"} votes:
                            <span className="number">{selectedChoiceId > -1 ? getRealVoteCount((proposalScores || proposal?.scores)[selectedChoiceId]) : getRealVoteCount(sum(proposalScores || proposal?.scores))}</span>
                        </div>
                    </div>
                    <div className="filter-container">
                        <div className="choice-selector">
                            <SingleChoiceButtonGroup onChange={i => {
                                setSelectedChoiceId(i)
                            }} items={proposal?.choices.map((c, i) => {
                                return { content: c }
                            })} />
                        </div>
                    </div>
                    <div className='main-container'>
                        <div>
                            {
                                votes?.length ? <table className="vote-table">
                                    <tbody>
                                        {
                                            votes.map((v, i) => {
                                                const account = accounts?.data?.list?.find(acc => compareIgnoringCase(acc.owner, v.voter))
                                                return <tr key={"vote-card" + i} className="vote-card">
                                                    <td style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                        {
                                                            account?.avatar ?
                                                                <WrappedLazyLoadImage className="avatar" alt="" src={account.avatar + ossImageThumbnailPrefix(40, 40)} /> :
                                                                <DefaultAvatarWithRoundBackground wallet={v.voter} className="avatar" />
                                                        }
                                                        <div className='name'><a href={`${localRouter('profile')}${v.voter}`}>{account?.username || addrShorten(v.voter)}</a></div>
                                                    </td>
                                                    <td className="choice">{proposal?.choices.filter((t, i) => i + 1 === v.choice)}</td>
                                                    <td className="number-wrapper">{getRealVoteCount(scoresObj[v.voter])} vote(s)</td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table> :
                                    <div style={{ color: '#888' }}>There is no votes data.</div>
                            }
                        </div>
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