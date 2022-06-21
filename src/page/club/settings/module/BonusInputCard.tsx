import React, { useMemo, useState } from 'react';
import ReactLoading from 'react-loading';
import { MainButton } from '../../../../module/button';
import { DurationInput, Input, Label, MultiSelect, Select, UNIT_DAY, UNIT_MONTH, UNIT_YEAR, unitNumToText } from '../../../../module/form';
import { capitalizeFirstLetter, pad } from '../../../../utils/stringUtils';
import { toFixedIfNecessary } from '../../../../utils/numberUtils';
import './BonusInputCard.css';

const bonusArrayToString = (values) => {
    console.log(values)
    if (!values?.length)
        return ''
    let res = ''
    values.forEach((v, i) => {
        if (i > 3)
            return
        res += v.text + ", "
    })
    res = res.substring(0, res.length - 2)
    if (values.length > 3)
        res += ' ...'
    return res
}
const BonusInputCard = props => {

    const { id, data, displayedId, attributesList, onChange, onClose, syncing } = props
    const [selectedAttribute, setSelectedAttribute] = useState<any>(attributesList?.find(a => a.field === data?.field))
    const [extraTicket, setExtraTicket] = useState(1)

    const title = useMemo(() => {
        if (data?.type === -1) {
            return '[Please select bonus basis]'
        } else if (data?.type === 1) {
            console.log(data.value)
            if (data.value && data.value > 0)
                return 'Holding time - ' + toFixedIfNecessary(data.value / data.field, 2) + ' ' + unitNumToText(data.field) + ' - ' + data.weight + "%"
            else return 'Holding time - [Please provide minimum holding period]'
        } else if (data?.type === 2) {
            if (!data.field)
                return 'Metadata attribute - [Please select trait type]'
            else if (!data.value?.length)
                return 'Metadata attribute - [Please select trait values]'
            else
                return 'Metadata attribute - ' + data.field + ' [' + bonusArrayToString(data.value) + '] - ' + data.weight + "%"
            // + ' - ' + data.weight+"%"
        }
    }, [data])


    const selectAttribute = (val) => {
        if (val === 'None') {
            setSelectedAttribute(null)
            onChange({
                id: id,
                weight: extraTicket,
                field: null,
                value: null,
                options: []
            })
        } else {
            setSelectedAttribute(attributesList.find(a => a.field === val))
            onChange({
                id: id,
                weight: extraTicket,
                field: val,
                value: [],
                options: []
            })
        }
    }
console.log(data)

    return <div className="BonusInputCard" style={{ border: 'none' }} >
        <div className="maintitle" >
            <div className='text'>{pad(displayedId, 2)}&nbsp;
                {title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* <img src="/imgs/tick_purple.svg" alt="" className='confirmbutton' onClick={() => onSubmit(data)} style={{ height: '22px' }} /> */}
                <img src="/imgs/close_purple4.svg" alt="" className='confirmbutton' style={{ height: '16px' }} onClick={() => onClose(id)} />
            </div>
        </div>
        <div className='container' >
            {data?.type === -1 ?
                <div className="BonusTypeSelectContainer">
                    <div className="BonusTypeOption" >
                        <img src="/imgs/holding-illu.jpg" alt="Hodl" />
                        <div style={{ textAlign: 'center' }}>
                            <MainButton onClick={e => {
                                onChange({ id: id, type: 1, field: UNIT_DAY })
                            }}>Holding period</MainButton>
                        </div>
                    </div>
                    <div className="BonusTypeOption" >
                        <img src="/imgs/metadata-illu.jpg" alt="Metadata" />
                        <div style={{ textAlign: 'center' }}>
                            <MainButton onClick={e => {
                                onChange({ id: id, type: 2 })
                            }}>Metadata</MainButton>
                        </div>
                    </div>
                </div> : null
            }{
                data?.type === 1 ? <div>
                    <div style={{ display: 'flex', gap: '50px' }}>
                        <div className="CreateClubPageFormGroup BonusRateInputGroup" >
                            <Label>Bonus rate</Label>
                            <Input multi={"true"} type='number' value={data.weight} onChange={(e) => {
                                setExtraTicket(parseInt(e.target.value))
                                onChange({
                                    id: id,
                                    weight: parseInt(e.target.value)
                                })
                            }} />
                        </div>
                        <div className="CreateClubPageFormGroup">
                            <Label style={{ display: 'flex', gap: '8px' }}>Holding period</Label>
                            <DurationInput
                                onChangeUnit={val => onChange({ id: id, field: val })}
                                onChange={val => onChange({ id: id, value: val })}
                                placeholder={1} unit={data.field || UNIT_DAY}
                                value={data.value || 0}
                                unitRange={[UNIT_DAY, UNIT_MONTH, UNIT_YEAR]} />
                        </div>
                    </div>
                </div> : null
            }
            {
                data?.type === 2 ? <div>
                    {
                        syncing ? <div className="Tip" style={{ marginBottom: '12px', marginTop: '-8px' }}>NFT attributes data is syncing. It might take 2-5 minutes.</div> : null
                    }

                    <div style={{ display: 'flex', gap: '50px' }}>
                        <div className="CreateClubPageFormGroup BonusRateInputGroup" >
                            <Label>Bonus rate</Label>
                            <Input multi={"true"} type='number' defaultValue={extraTicket} onChange={(e) => {
                                setExtraTicket(parseInt(e.target.value))
                                onChange({
                                    id: id,
                                    weight: parseInt(e.target.value)
                                })
                            }} />
                        </div>
                        <div className="CreateClubPageFormGroup">
                            <Label style={{ display: 'flex', gap: '8px' }}>Trait type {syncing ? <ReactLoading className="loading" type={'spokes'} color={'#444'} height={'14px'} width={'14px'} /> : null}</Label>
                            <Select keyid="attr" defaultValue={data?.field || ''}
                                onChange={(e) => {
                                    selectAttribute(e.target.value)
                                }}
                                options={[{ text: 'None', value: 'None' }, ...(attributesList ? attributesList.map(attr => { return { text: capitalizeFirstLetter(attr.field), value: attr.field } }) : [])]}></Select>
                        </div>
                    </div>
                    <div className="CreateClubPageFormGroup" style={{ width: '100%' }}>
                        <Label>Values</Label>
                        <MultiSelect keyid="value" style={{ width: '100%' }}
                            value={data?.value || []}
                            options={selectedAttribute ?
                                [{ text: 'None', value: 'None' }, ...(selectedAttribute.values.map(v => { return { text: v, value: v } }))] :
                                [{ text: 'None', value: 'None' }]}
                            onChange={selectedOption => {
                                onChange({
                                    id: id,
                                    weight: extraTicket,
                                    field: selectedAttribute.field,
                                    value: selectedOption
                                })
                            }} />
                    </div>
                </div> : null
            }

        </div>
    </div>
}


export default BonusInputCard