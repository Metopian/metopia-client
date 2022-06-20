import React, { useMemo, useState } from 'react';
import ReactLoading from 'react-loading';
import { MainButton } from '../../../../module/button';
import { DurationInput, Input, Label, MultiSelect, Select, UNIT_DAY, UNIT_MONTH, UNIT_YEAR } from '../../../../module/form';
import { capitalizeFirstLetter, pad } from '../../../../utils/stringUtils';
import './BonusInputCard.css';

const BonusInputCard = props => {

    const { id, data, displayedId, attributesList, onChange, onClose, syncing } = props
    const [selectedAttribute, setSelectedAttribute] = useState<any>(attributesList?.find(a => a.field === data?.field))
    const [extraTicket, setExtraTicket] = useState(1)

    const title = useMemo(() => {
        if (data?.type === -1) {
            return '[Please select bonus basis]'
        } else if (data?.type === 1) {
            return 'Holding time - [Please provide minimum holding period]'
        } else if (data?.type === 2) {
            return 'Metadata attribute - [Please select trait type]'
        }
    }, [data?.type])


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

    const updateForm = (param) => {

    }

    return <div className="BonusInputCard" style={{ border: 'none' }} >
        <div className="maintitle" style={{ background: 'rgba(240, 240, 240, 0.4)', backgroundSize: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <div className='text'>{pad(displayedId, 2)}&nbsp;
                {title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* <img src="/imgs/tick_purple.svg" alt="" className='confirmbutton' onClick={() => onSubmit(data)} style={{ height: '22px' }} /> */}
                <img src="/imgs/close_purple4.svg" alt="" className='confirmbutton' style={{ height: '16px' }} onClick={() => onClose(id)} />
            </div>
        </div>
        <div style={{ background: 'rgba(240, 240, 240, 0.4)', padding: '16px 30px', marginTop: '2px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            {data?.type === -1 ?
                <div className="BonusTypeSelectContainer">
                    <div className="BonusTypeOption" >
                        <img src="/imgs/holding-illu.jpg" alt="Hodl" />
                        <div style={{ textAlign: 'center' }}>
                            <MainButton onClick={e => {
                                onChange({ id: id, type: 1 })
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
                            <Input multi={"true"} type='number' defaultValue={extraTicket} onChange={(e) => {
                                setExtraTicket(parseInt(e.target.value))
                                onChange({
                                    id: id,
                                    weight: parseInt(e.target.value)
                                })
                            }} />
                        </div>
                        <div className="CreateClubPageFormGroup">
                            <Label style={{ display: 'flex', gap: '8px' }}>Holding period</Label>
                            <DurationInput onChange={val => onChange({ id: id, period: val })}
                                placeholder={1} defaultUnit={UNIT_DAY}
                                value={data.period || 0}
                                unitRange={[UNIT_DAY, UNIT_MONTH, UNIT_YEAR]} />
                        </div>
                    </div>
                </div> : null
            }
            {
                data?.type === 2 ? <div>
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
                            <Label style={{ display: 'flex', gap: '8px' }}>Trait type {syncing ? <ReactLoading type={'spokes'} color={'#444'} height={'14px'} width={'14px'} /> : null}</Label>
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