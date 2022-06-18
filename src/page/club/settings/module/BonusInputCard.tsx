import React, { useState } from 'react';
import ReactLoading from 'react-loading';
import { Input, Label, MultiSelect, Select } from '../../../../module/form';
import { pad } from '../../../../utils/stringUtils';
import './BonusInputCard.css';

const BonusInputCard = props => {
    const { id, data, displayedId, attributesList, onChange, onClose, syncing } = props
    const [selectedAttribute, setSelectedAttribute] = useState<any>(attributesList?.find(a => a.field === data?.field))
    const [extraTicket, setExtraTicket] = useState(1)

    return <div className="BonusInputCard" style={{ border: 'none' }} >
        <div className="maintitle" style={{ background: 'rgba(240, 240, 240, 0.4)', backgroundSize: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <div className='text'>{pad(displayedId, 2)} {data?.field?.length ? data.field : '[Bonus]'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* <img src="/imgs/tick_purple.svg" alt="" className='confirmbutton' onClick={() => onSubmit(data)} style={{ height: '22px' }} /> */}
                <img src="/imgs/close_purple4.svg" alt="" className='confirmbutton' style={{ height: '16px' }} onClick={() => onClose(id)} />
            </div>
        </div>
        <div style={{ background: 'rgba(240, 240, 240, 0.4)', padding: '16px 30px', marginTop: '2px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '50px' }}>
                <div className="CreateClubPageFormGroup">
                    <Label style={{ display: 'flex' }}><select>
                        <option>Metadata</option>
                    </select></Label>
                </div>
                <div className="CreateClubPageFormGroup">
                    <Label style={{ display: 'flex', gap: '8px' }}>Trait {syncing ? <ReactLoading type={'spokes'} color={'#444'} height={'14px'} width={'14px'} /> : null}</Label>
                    <Select keyid="attr" defaultValue={data?.field || ''}
                        onChange={(e) => {
                            let value = e.target.value
                            console.log(value)
                            if (value === 'None') {
                                setSelectedAttribute(null)
                                onChange({
                                    id: id,
                                    weight: extraTicket,
                                    field: null,
                                    value: null,
                                    options: []
                                })
                            }
                            else {
                                setSelectedAttribute(attributesList.find(a => a.field === value))
                                onChange({
                                    id: id,
                                    weight: extraTicket,
                                    field: e.target.value,
                                    value: [],
                                    options: []
                                })
                            }
                        }}
                        options={[{ text: 'None', value: 'None' }, ...(attributesList ? attributesList.map(attr => { return { text: attr.field, value: attr.field } }) : [])]}></Select>
                </div>

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
        </div>
    </div>
}


export default BonusInputCard