import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import parse from 'html-react-parser';
import React, { useEffect, useMemo, useState } from 'react';
import ReactLoading from 'react-loading';
import { domain, Vote, vote2Types } from '../../../config/snapshotConfig';
import { localRouter, snapshotApi } from '../../../config/urls';
import { useProposal, useScoreData } from '../../../governance';
import { DefaultAvatarWithRoundBackground } from '../../../module/image';
import { sum } from '../../../utils/numberUtils';
import { addrShorten, capitalizeFirstLetter } from '../../../utils/stringUtils';
import { customFormat, getDateDiff } from '../../../utils/TimeUtil';
import { getAddress, getProvider } from '../../../utils/web3Utils';
import './index.css';

const getRealVoteCount = (vote: number) => {
    return vote / 100
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
    // const [proposal, setProposal] = useState<any>({})
    const [votes, setVotes] = useState([])
    const [selectedOptionId, setSelectedOptionId] = useState(-1)
    const [voting, setVoting] = useState(false)
    const [self, setSelf] = useState(null)
    const [authorEns, setAuthorEns] = useState(null)

    useEffect(() => {
        getAddress().then(addr => setSelf(addr))
    }, [])

    useEffect(() => {
        if (proposal?.author)
            getProvider().lookupAddress(proposal?.author).then(e => setAuthorEns(e))

    }, [proposal])

    const getAddressToCalcScore = () => {
        let res = []
        self && res.push(self)
        votes?.forEach(v => res.push(v.voter))
        return res
    }
    const { data: scores } = useScoreData(id, "1", proposal?.snapshot, proposal?.strategies, getAddressToCalcScore())

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
                    console.log(r.error)
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

    const initVotes = () => {
        let votesParam = {
            "operationName": "Votes",
            "variables": {
                "id": id,
                "orderBy": "vp",
                "orderDirection": "desc",
                "first": 10
            },
            "query": "query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $voter: String) {\n  votes(\n    first: $first\n    skip: $skip\n    where: {proposal: $id, vp_gt: 0, voter: $voter}\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    ipfs\n    voter\n    choice\n    vp\n    vp_by_strategy\n  }\n}"
        }
        return fetch(snapshotApi.graphql, {
            method: 'POST',
            body: JSON.stringify(votesParam),
            headers: {
                'content-type': "application/json"
            }
        }).then(d => d.json()).then(d => {
            setVotes(d.data.votes)
        })
    }

    useEffect(() => {
        let voteFetcher = initVotes()
        Promise.all([voteFetcher])
    }, [])

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
    }, [scores])

    let mychoice = -1
    if (self) {
        if (votes && self) {
            votes.forEach((v) => {
                console.log(v, self.toLowerCase(), v.voter.toLowerCase())
                if (self.toLowerCase() === v.voter.toLowerCase()) {
                    mychoice = v.choice - 1
                }
            })
        }
    }
    console.log(voteSum, scores?.result?.scores)

    return <div className="ProposalIndexPage">
        <div className="CreateClubPageTitle"><img src="/imgs/arrow-left.svg" className="backarrow" alt="back" onClick={() => {
            window.location.href = localRouter("club.prefix") + (proposal.space?.id)
        }} />Voting</div>
        <div className='ProposalContainer'>
            <div className="leftcontainer">
                <div className="authorcontainer">
                    <a href={`${localRouter('profile')}${proposal?.author}`}>
                        <DefaultAvatarWithRoundBackground wallet={proposal?.author} className="ProposalCardUserAvatar" />
                        <div className="ProposalCardAddr">{authorEns || addrShorten(proposal?.author)}</div>
                    </a>
                </div>
                <div className="title">{proposal?.title}</div>
                <div className="body">{proposal?.body && parse(proposal.body)}</div>
            </div>
            <div className="rightcontainer">
                <div className="votingcontainer">
                    <div className='head'>
                        <div className='maintitle'><div className="text">Voting</div></div>
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
                        <div className="bottom">
                            {proposal?.start ? customFormat(new Date(proposal.start * 1000), ("#YYYY#-#MM#-#DD# #hhhh#:#mm#")) : ''}&nbsp;-&nbsp;
                            {proposal?.end ? customFormat(new Date(proposal.end * 1000), ("#YYYY#-#MM#-#DD# #hhhh#:#mm#")) : ''}</div>
                    </div>
                    <div>
                        {
                            proposal?.choices.map((c, i) => {
                                return <div key={`choiceoption${i}`}
                                    className={'choiceoption ' + (selectedOptionId === i + 1 || mychoice === i ? 'selected' : '') + (mychoice > -1 ? ' disabled' : '')}
                                    onClick={() => {
                                        if (mychoice > -1)
                                            return
                                        if (selectedOptionId === i + 1)
                                            setSelectedOptionId(-1)
                                        else
                                            setSelectedOptionId(i + 1)
                                    }}>
                                    <div className="bg" style={{ width: voteSum[i] / sum(voteSum) * 100 + "%" }}></div>
                                    <div className="container">
                                        <div className="optiontitle">{c}{mychoice === i ? <div className='tick'>√</div> : ''}</div>
                                        <div>{voteSum[i] / sum(voteSum) * 100}%</div>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                    {
                        mychoice === -1 && proposal?.state === 'active' ? <div className={'choiceoptionbutton ' + (scoresObj[self] ? "" : " disabled")}
                            onClick={doVote}>{scoresObj[self] ? "Cast " + getRealVoteCount(scoresObj[self]) + " Vote" : "You can't vote"}{voting ? <ReactLoading type='spokes' height={20} width={20} className="loading" /> : null}</div> : null
                    }

                </div>

                <div className="resultcontainer" >
                    <div className='maintitle'>
                        <div className="text">Current results</div>
                        <div className='numberwrapper'>Total: <span className="number">{getRealVoteCount(sum(voteSum))}</span></div>
                    </div>
                    <div className='voteContainer'>
                        {
                            votes?.length ? <div>
                                {
                                    votes.map((v, i) => <div key={"votecard" + i} className="votecard">
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            {/* <img src="/imgs/face.svg" className="avatar" alt="" /> */}
                                            <DefaultAvatarWithRoundBackground wallet={v.voter} />
                                            <div className='name'><a href={`${localRouter('profile')}${v.voter}`}>{addrShorten(v.voter)}</a></div>
                                        </div>
                                        <div>{proposal?.choices.filter((t, i) => i + 1 === v.choice)}</div>
                                        <div className="numberwrapper">{getRealVoteCount(scoresObj[v.voter])} vote(s)</div>
                                    </div>)
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