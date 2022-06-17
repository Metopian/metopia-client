import { Web3Provider } from '@ethersproject/providers';
import { ethers, utils } from "ethers";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import ReactLoading from 'react-loading';
import { arabToRoman } from 'roman-numbers';
import { domain, Proposal, proposalTypes } from '../../../config/snapshotConfig';
import { useChainId } from '../../../config/store';
import { localRouter, snapshotApi } from '../../../config/urls';
import { MainButton } from '../../../module/button';
import { DefaultTextEditor as RichTextEditor } from '../../../module/editor/RichTextEditor';
import { Input, Label } from '../../../module/form';
import { getAddress, getProvider, signTypedData } from '../../../utils/web3Utils'
import './index.css';

const CreateProposalPage = props => {
    const { space } = props
    const [body, setBody] = useState("")
    const defaultOptions = [{ id: 0, text: "For" }, { id: 1, text: "Against" }, { id: 2, text: "Abstain" }]
    const [options, setOptions] = useState(defaultOptions)

    const [spaceSettings, setSpaceSetting] = useState<any>()

    const [start, setStart] = useState(moment())
    const [end, setEnd] = useState(moment())
    const { chainId } = useChainId()

    const addOption = useCallback(() => {
        let maxId = 0
        options.forEach(o => { if (o.id > maxId) maxId = o.id })
        let tmp = [...options, { id: maxId + 1, text: arabToRoman(maxId + 1) }]
        setOptions(tmp)
    }, [options])

    const removeOption = useCallback((id) => {
        let tmp = options.filter(o => o.id !== id)
        setOptions(tmp)
    }, [options])

    let optionJsx = useMemo(() => {
        return options.map((op, i) => {
            return <div className="optioncard" key={'optioncard' + i} >
                <div style={{ width: '100px' }}>Option {arabToRoman(i + 1)}</div>
                <Input key={"option" + op.id} placeholder={"Option " + (i + 1)}
                    onChange={(e) => {
                        let tmp = options.find(t => t.id === op.id)
                        tmp.text = e.target.value
                        setOptions(options.map(o => o))
                    }} value={options.find(t => t.id === op.id).text} />
                <img src="/imgs/close.svg" alt="remove" className='removebutton' onClick={() => removeOption(op.id)} />
            </div>
        })
    }, [options, removeOption])

    useEffect(() => {
        if (!space)
            return
        fetch(snapshotApi.dao_selectById + "/?id=" + encodeURIComponent(space), {
        }).then(d => {
            return d.json()
        }).then(d => {
            if (d.content && d.content.settings) {
                setSpaceSetting(JSON.parse(d.content.settings))
                let delay = parseInt(JSON.parse(d.content.settings).voting?.delay || 0)
                let period = parseInt(JSON.parse(d.content.settings).voting?.period || 0)
                setStart(moment().add(delay, 'seconds'))
                setEnd(moment().add(delay + period, 'seconds'))
            }
        })
    }, [space])

    const delay = parseInt(spaceSettings?.voting?.delay || 0)
    const period = parseInt(spaceSettings?.voting?.period || 0)

    const createProposal = async (cb) => {
        const provider = getProvider()
        const account = await getAddress()
        let blocknumber = await provider.getBlockNumber()
        let timestamp = Math.ceil(new Date().getTime() / 1000),
            startUnix = start.unix(),
            endUnix = end.unix()
        signTypedData({
            "space": space,
            "type": "single-choice",
            "title": (document.getElementById("proposaltitleinput") as HTMLInputElement).value,
            "body": body,
            "choices": options.map(o => o.text),
            "start": startUnix,
            "end": endUnix,
            "snapshot": blocknumber,
            "network": parseInt(chainId).toString(),
            "strategies": JSON.stringify(spaceSettings.strategies),
            "plugins": "{}",
            "metadata": "{}",
            "from": account,
            "timestamp": timestamp,
        }, proposalTypes, domain).then(res => {
            fetch(snapshotApi.msg, {
                method: "POST",
                body: JSON.stringify(res),
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                }
            }).then(r => r.json()).then(cb)
        }) 
    }

    return <div className="CreateProposalPage">
        <div className="CreateClubPageHead">
            <div className="CreateClubPageTitle" ><img src="/imgs/arrow-left.svg" className="backarrow" alt="back" onClick={() => {
                window.location.href = localRouter("club.prefix") + space
            }} />Create new proposal
            </div>
            <MainButton style={{ width: '104px' }} onClick={() => {
                createProposal((d) => {
                    if (d.id) {
                        window.alert("Succeed")
                        window.location.href = localRouter("club.prefix") + space
                    } else {
                        window.alert("Failed")
                    }

                })
            }}>Confirm</MainButton>
        </div>
        <div className="maincontainer">
            <div className="CreateProposalForm">
                <Label >{"Title & Description"}</Label>
                <div className="CreateProposalMainEditorWrapper">
                    <RichTextEditor html className="BlogEditor" onChange={setBody} placeholder="Please enter the description of your proposal">
                        <Input placeholder={"Please enter the title of your proposal"} id="proposaltitleinput" autoComplete="off" />
                    </RichTextEditor>
                </div>
                <div className='timecontainer'>
                    <div>
                        <div className='RLabel'>Duration</div>
                        <div className='timeinputgroupwrapper'>
                            <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm"} renderInput={(props, openCalendar, closeCalendar) => {
                                return <div className='timeinputwrapper'>
                                    <input {...props} className="RInput" placeholder={"Start time"}
                                        onChange={e => false} />
                                    <img src="/imgs/calendar.svg" alt="" className='calendaricon' />
                                </div>
                            }} isValidDate={(currentDate, selectedDate) => {
                                return !currentDate?.isBefore(moment(moment().add(delay, 'seconds').format('YYYY-MM-DD')))
                            }} onChange={d => {
                                setStart(moment(d))
                                let endLimit = moment(d).add(delay + period, 'seconds')
                                if (end.isBefore(endLimit)) {
                                    setEnd(endLimit)
                                }
                            }} value={start} />

                            <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm"} renderInput={(props, openCalendar, closeCalendar) => {
                                return <div className='timeinputwrapper'>
                                    <input {...props} className="RInput" placeholder={"End time"}
                                        onChange={e => false} />
                                    <img src="/imgs/calendar.svg" alt="" className='calendaricon' />
                                </div>
                            }} isValidDate={(currentDate, selectedDate) => {
                                return !currentDate?.isBefore(moment(moment(start).add(delay + period, 'seconds').format('YYYY-MM-DD')))
                            }} value={end} onChange={d => setEnd(moment(d))} />
                        </div>
                    </div>
                </div>

                <div className="CreateClubPageFormGroup option" style={{ marginTop: '30px' }}>
                    <Label>Options</Label>
                    {optionJsx}
                    <div className="addmorebonusbutton" onClick={addOption} style={{ marginTop: '24px' }}><img src="/imgs/addbuttonround.png" alt="" />Add option</div>
                </div>

            </div>
        </div>
    </div >
}

export default CreateProposalPage