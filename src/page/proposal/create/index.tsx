import $ from 'jquery';
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { arabToRoman } from 'roman-numbers';
import { domain, proposalTypes } from '../../../config/snapshotConfig';
import { useChainId } from '../../../config/store';
import { localRouter, snapshotApi, nftDataApi } from '../../../config/urls';
import { MainButton } from '../../../module/button';
import {
    DefaultTextEditor as RichTextEditor,
    Emoji,
    Bold, Italic, Underline, StrikeThrough,
    Code,
    Link, RemoveLink,
    Left, Center, Right,
    H1, H2, H3, H4, H5,
    Quote,
    List,
    UList,
    FontSize
} from '../../../module/editor/RichTextEditor';
import { Input, Label } from '../../../module/form';
import { encodeQueryData } from '../../../utils/RestUtils';
import { getAddress, getProvider, signTypedData } from '../../../utils/web3Utils';
import './index.scss';

const CreateProposalPage = props => {
    const { space } = props
    const [body, setBody] = useState("")
    const defaultOptions = [{ id: 0, text: "For" }, { id: 1, text: "Against" }, { id: 2, text: "Abstain" }]
    const [options, setOptions] = useState(defaultOptions)

    const [spaceSettings, setSpaceSetting] = useState<any>()

    const [start, setStart] = useState(moment())
    const [end, setEnd] = useState(moment())
    const { chainId } = useChainId()
    const container = useRef(null)
    const [now, setNow] = useState(null)

    const [errors, setErrors] = useState(null)

    useEffect(() => {
        $('.MainContainer').css({ 'overflow-y': 'hidden' })
        return () => {
            $('.MainContainer').css({ 'overflow-y': 'auto' })
        }
    })

    const addOption = useCallback(() => {
        let maxId = 0
        options.forEach(o => { if (o.id > maxId) maxId = o.id })
        let tmp = [...options, { id: maxId + 1, text: '' }]
        setOptions(tmp)
    }, [options])

    const removeOption = useCallback((id) => {
        let tmp = options.filter(o => o.id !== id)
        setOptions(tmp)
    }, [options])

    let optionJsx = useMemo(() => {
        return options.map((op, i) => {
            return <div className="option-card" key={'optioncard' + i} >
                <div style={{ width: '100px' }}>Option {arabToRoman(i + 1)}</div>
                <Input key={"option" + op.id} placeholder={"Option " + arabToRoman(i + 1)}
                    onChange={(e) => {
                        let tmp = options.find(t => t.id === op.id)
                        tmp.text = e.target.value
                        setOptions(options.map(o => o))
                    }} value={options.find(t => t.id === op.id).text} />
                <img src="/imgs/close.svg" alt="remove" className='remove-button' onClick={() => removeOption(op.id)} />
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
                let tmp = moment()
                setNow(tmp)
                setStart(moment(tmp).add(delay, 'seconds'))
                setEnd(moment(tmp).add(delay + period, 'seconds'))
            }
        })
    }, [space])

    const delay = parseInt(spaceSettings?.voting?.delay || 0)
    const period = parseInt(spaceSettings?.voting?.period || 0)

    const createProposal = async (cb) => {
        setErrors(null)
        const provider = getProvider()
        const account = await getAddress()
        let blocknumber = await provider.getBlockNumber()
        let timestamp = now.unix(),
            startUnix = start.unix(),
            endUnix = end.unix()
        spaceSettings.strategies.forEach(s => {
            fetch(encodeQueryData(nftDataApi.nft_transfer_cacheAll, { chain_id: `0x${s.params.network}`, address: s.params.address }))
        })
        let title = (document.getElementById("proposaltitleinput") as HTMLInputElement).value
        if (!title?.length)
            setErrors({ title: 'Title cannot be empty' })

        if (errors && Object.keys(errors).length) {
            alert(errors[Object.keys(errors)[0]])
            return
        }

        signTypedData({
            "space": space,
            "type": "single-choice",
            "title": title,
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

    return <div className="create-proposal-page">
        <div className="head">
            <div className="title" ><img src="/imgs/arrow-left.svg" className="backarrow" alt="back" onClick={() => {
                window.location.href = localRouter("club.prefix") + space
            }} />Create new proposal
            </div>
            <MainButton style={{ width: '104px' }} onClick={() => {
                createProposal((d) => {
                    if (d.id) {
                        window.alert("Succeed")
                        window.location.href = localRouter("club.prefix") + space
                    } else {
                        if (d.error_description === 'failed to check validation')
                            alert('You are not authorized to create the proposal')
                        else
                            window.alert("Failed")
                    }

                })
            }}>Confirm</MainButton>
        </div>
        <div className="body" ref={container} onScroll={e => {
            $('#createClubScrollbar').css({
                "top": (container.current.scrollTop + 80 + ((container.current.clientHeight - 240) * container.current.scrollTop /
                    (container.current.scrollHeight - container.current.clientHeight))) + 'px'
            })
        }}>
            <div className="scrollbar" id="createClubScrollbar"></div>
            <div className="form">
                {errors?.title && <div className="ErrorHint">{errors.title}</div>}
                <Label >{"Title & Description"}</Label>
                <div className="editor-wrapper">
                    <RichTextEditor html className="BlogEditor" onChange={setBody} placeholder="Please enter the description of your proposal" toolbar={
                        [[H1, H2, H3, H4, H5],
                        [Bold, Italic, Underline, StrikeThrough, Code],
                        [Link, RemoveLink],
                        [Left, Center, Right],
                        [Quote, List, UList],
                        [Emoji]]
                    }>
                        <Input placeholder={"Please enter the title of your proposal"} id="proposaltitleinput" autoComplete="off" />
                    </RichTextEditor>
                </div>
                <div className='time-container'>
                    <div>
                        <div className='r-label'>Duration</div>
                        <div className='time-input-group-wrapper'>
                            <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm"} renderInput={(props, openCalendar, closeCalendar) => {
                                return <div className='time-input-wrapper'>
                                    <input {...props} className="r-input" placeholder={"Start time"}
                                        onChange={e => false} />
                                    <img src="/imgs/calendar.svg" alt="" className='calendar-icon' />
                                </div>
                            }} isValidDate={(currentDate, selectedDate) => {
                                return !currentDate?.isBefore(moment(moment(now).add(delay, 'seconds').format('YYYY-MM-DD')))
                            }} onChange={d => {
                                setStart(moment(d))
                                let endLimit = moment(d).add(delay + period, 'seconds')
                                if (end.isBefore(endLimit)) {
                                    setEnd(endLimit)
                                }
                            }} value={start} inputProps={{ disabled: delay !== null && delay > 0 }} />

                            <Datetime dateFormat={"YYYY-MM-DD"} timeFormat={"HH:mm"} renderInput={(props, openCalendar, closeCalendar) => {
                                return <div className='time-input-wrapper'>
                                    <input {...props} className="r-input" placeholder={"End time"}
                                        onChange={e => false} />
                                    <img src="/imgs/calendar.svg" alt="" className='calendar-icon' />
                                </div>
                            }} isValidDate={(currentDate, selectedDate) => {
                                return !currentDate?.isBefore(moment(moment(start).add(delay + period, 'seconds').format('YYYY-MM-DD')))
                            }} value={end} onChange={d => setEnd(moment(d))} inputProps={{ disabled: period !== null && period > 0 }} />
                        </div>
                    </div>
                </div>

                <div className="form-group option" style={{ marginTop: '30px' }}>
                    <Label>Options</Label>
                    {optionJsx}
                    <div style={{ display: 'flex', marginTop: '26px' }}>
                        <div className="add-more-bonus-button" onClick={addOption} ><img src="/imgs/addbuttonround.png" alt="" />Add option</div>
                    </div>
                </div>

            </div>
        </div>
    </div >
}

export default CreateProposalPage