import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { update as reduxUpdateForm } from '../../../../config/redux/formSlice';
import { RootState } from '../../../../config/store';
import { MainButton } from '../../../../module/button';
import { Input, Label, MultiSelect, Select, SelectV2 } from '../../../../module/form';
import AdminInputCard from '../module/AdminInputCard';
import './ProposalForm.scss';
import { max } from '../../../../utils/numberUtils';
import { useGuildsData, useRolesData } from '../../../../third-party/discord';

const useData = () => {
    const formId = "proposal"
    const { form: formData } = useSelector((state: RootState) => state.form)
    const data = formData && formData[formId] ? formData[formId] : { validation: { name: "basic", params: {} }, filters: { onlyMembers: false, minScore: 0 }, members: [] }
    const dispatch = useDispatch()

    const update = (newValue) => {
        dispatch(reduxUpdateForm({
            key: formId,
            value: Object.assign({}, data, newValue)
        }))
    }

    return { formId, data, update }
}

const DaoMemberForm = props => {
    const { value, onChange } = props
    return <div className="typed-form-content" >
        <div className='form-group'>
            <Label>Minimum voting power</Label>
            <Input type='number' value={value} onChange={onChange} />
        </div>
    </div>
}

const AssignedAuthorForm = props => {
    const { members, updateForm } = props
    return <div className="typed-form-content">
        <div className="form-group">
            <Label>Authors</Label>
            {
                members.map(admin => {
                    return <AdminInputCard key={'AdminInputCard' + admin.id} data={admin} onChange={(val) => {
                        updateForm({ members: members.map(tmp => tmp.id === admin.id ? Object.assign({}, admin, { address: val }) : tmp) })
                    }}
                        onDelete={e => updateForm({ members: members.filter(tmp => tmp.id !== admin.id || tmp.id === 1) })}
                    />
                })
            }
            <div className='add-admin-button-wrapper'>
                <img src="/imgs/addbuttonround.png" alt="add" className='add-admin-button' onClick={e => {
                    if (!members.find(ad => ad.address.trim().length === 0)) {
                        let maxId = max(members, 'id')
                        updateForm({ members: [...(members || []), { address: '', id: maxId + 1 }] })
                    }
                }} />
            </div>
        </div>
    </div>
}


const modeNames = ["DAO members", "Assigned authors", "Specified guild members"]
const ProposalForm = props => {
    const { errors } = props
    const [mode, setMode] = useState(-1)
    const { data: formData, update: updateForm } = useData()
    const { data: guildsData } = useGuildsData()
    const [selectedGuild, setSelectedGuild] = useState(null)
    const { data: roleData } = useRolesData(selectedGuild?.guildId)

    return <div className={"create-club-form"}>
        <Label style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>Proposal validation</Label>

        <div className="Tip" style={{ marginTop: '-10px', marginBottom: '30px' }}>Who have the power to raise proposal?</div>
        {
            mode === -1 ?
                <div className='type-selector'>
                    <div className='option'>
                        <img src="/imgs/teamwork-illu.jpg" alt="" />
                        <MainButton onClick={e => {
                            updateForm({ validation: { name: "basic", params: {} }, filters: { onlyMembers: false, minScore: 0 }, members: [] })
                            setMode(0)
                        }}>{modeNames[0]}</MainButton>
                    </div>
                    <div className='option'>
                        <img src="/imgs/expert.jpg" alt="" />
                        <MainButton onClick={e => {
                            updateForm({ validation: { name: "basic", params: {} }, filters: { onlyMembers: true, minScore: 0 }, members: [] })
                            setMode(1)
                        }}>{modeNames[1]}</MainButton>
                    </div>
                    <div className='option'>
                        <img src='/imgs/guild.png' alt="" />
                        <MainButton onClick={e => {
                            updateForm({ validation: { name: "discord", params: { guildId: '', roles: [] } }, filters: { onlyMembers: false, minScore: 0 }, members: [] })
                            setMode(2)
                        }}>{modeNames[2]}</MainButton>
                    </div>
                </div> : null
        }
        {
            mode > -1 ?
                <div className='form-container'>
                    <div className='form-group mode' style={{ marginBottom: '30px' }}>
                        <Label>Mode</Label>
                        <div className='value'>{modeNames[mode]}</div>
                        <img src="/imgs/switch.svg" alt="switch" onClick={e => {
                            updateForm({ validation: { name: "basic", params: {} }, filters: { onlyMembers: false, minScore: 0 }, members: [] })
                            setMode(-1)
                        }} />
                    </div>
                    {
                        mode === 0 ?
                            <DaoMemberForm value={formData.filters.minScore} onChange={e => updateForm({ filters: { onlyMembers: false, minScore: e.target.value } })} /> : null
                    }{
                        mode === 1 ? <AssignedAuthorForm members={formData.members} updateForm={updateForm} /> : null
                    }{
                        mode === 2 ?

                            <div className="typed-form-content">

                                {errors.proposal ? <div className="ErrorHint" >{errors.proposal}</div> : null}
                                <div className='form-group'>
                                    <Label>Select your guild</Label>
                                    <SelectV2 options={guildsData?.data?.guilds.map(g => {
                                        return {
                                            value: g.guildId, text: g.name,
                                            ele: <div className="guild-option"><img src={`https://cdn.discordapp.com/icons/${g.guildId}/${g.icon}.png`} alt=""/>{g.name}</div>
                                        }
                                    })} onChange={({ value }) => {
                                        updateForm({ validation: { name: "discord", params: { guildId: value, roles: [] } } })
                                        setSelectedGuild(guildsData?.data?.guilds.find(g => g.guildId === value))
                                    }} />
                                    <div className='link'>
                                        <a href="https://discord.com/oauth2/authorize?client_id=971716386877480960&scope=bot&permissions=268436480" target="_blank" rel="noreferrer">
                                            Cannot find your guild? Add Metopia bot to your guild.
                                        </a>
                                    </div>
                                </div>
                                <div className='form-group' style={{ width: '100%' }}>
                                    <Label>Specify the roles</Label>
                                    <MultiSelect options={[{ value: 'none', text: 'Click to select roles' }, ...(roleData?.data?.roles.filter(r => r.position > 0).map(r => {
                                        return {
                                            value: r.roleId,
                                            text: r.name
                                        }
                                    }) || [])]} value={roleData?.data?.roles.filter(r1 => formData.validation.params.roles?.find(r2 => r1.roleId === r2)).map(r => {
                                        return {
                                            value: r.roleId,
                                            text: r.name
                                        }
                                    }) || []} onChange={selected => {
                                        console.log(selected)
                                        updateForm({
                                            validation: {
                                                name: "discord", params: {
                                                    guildId: selectedGuild.guildId,
                                                    roles: selected.map(s => s.value)
                                                }
                                            }
                                        })
                                    }} />

                                </div>
                            </div> : null
                    }
                </div> : null
        }
    </div>
}

export { ProposalForm, useData };

