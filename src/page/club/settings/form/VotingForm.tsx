import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { update as reduxUpdateForm } from '../../../../config/redux/formSlice';
import { RootState } from '../../../../config/store';
import { Input, Label, DurationInput } from '../../../../module/form';
import './VotingForm.css';

const useData = (defaultData?) => {
    const formId = "voting"
    const { form: formData } = useSelector((state: RootState) => state.form)
    const data = formData && formData[formId] ? formData[formId] : { delay: 0, period: 3600, quorum: 0, hideAbstain: false }
    const dispatch = useDispatch()

    const update = (newValue) => {
        dispatch(reduxUpdateForm({
            key: formId,
            value: Object.assign({}, data, newValue)
        }))
    }

    useEffect(() => {
        // update({ delay: 0, period: 3600, quorum: 0, hideAbstain: false })
        if (defaultData) {
            update(defaultData)
        }
    }, [defaultData])

    return { formId, data, update }
}


const VotingForm = props => {
    const { display } = props
    const { data, update: updateForm } = useData()
    return <div className={"CreateClubForm" + (display ? '' : ' hidden')}  >
        {/* <div className="CreateClubPageTitle">Proposal settings</div> */}
        <div className="CreateClubPageFormGroup second" >
            <Label>Preparation period</Label>
            <div style={{ marginTop: '-10px', marginBottom: '30px', color: '#888' }}>How long will it take for a proposal from starting to public voting?</div>
            <DurationInput onChange={val => updateForm({ delay: val })} placeholder={0}
                value={data.delay} />
        </div>
        <div className="CreateClubPageFormGroup second">
            <Label>Active period</Label>
            <div style={{ marginTop: '-10px', marginBottom: '30px', color: '#888' }}>How long will the public voting last?</div>
            <DurationInput onChange={val => updateForm({ period: val })} placeholder={3600} value={data.period} />
        </div>
        <div className="CreateClubPageFormGroup">
            <Label>Quorum</Label>
            <div style={{ marginTop: '-10px', marginBottom: '30px', color: '#888' }}>How many members are required to validate each proposal?</div>
            <Input placeholder={0} value={data.quorum} onChange={(e) => updateForm({ quorum: parseInt(e.target.value) })} type='number' />
        </div>
    </div>
}

export { VotingForm, useData };
