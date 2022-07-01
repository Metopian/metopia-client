import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { update as reduxUpdateForm } from '../../../../config/redux/formSlice';
import { RootState } from '../../../../config/store';
import { DurationInput, Input, Label } from '../../../../module/form';

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
        if (defaultData) {
            update(defaultData)
        }
    }, [defaultData])

    return { formId, data, update }
}

const VotingForm = props => {
    const { data, update: updateForm } = useData()
    return <div className={"create-club-form"}  >
        {/* <div className="CreateClubPageTitle">Proposal settings</div> */}
        <div className="form-group second">
            <Label>Preparation period</Label>
            <div className="Tip" style={{ marginTop: '-10px', marginBottom: '20px' }}>How long will it take for a proposal from starting to public voting?</div>
            <DurationInput
                onChange={val => updateForm({ delay: val })}
                placeholder={0}
                value={data.delay}
                unit={data.delayUnit || 1}
                onChangeUnit={val => updateForm({ delayUnit: val })} />
        </div>
        <div className="form-group second">
            <Label>Active period</Label>
            <div className="Tip" style={{ marginTop: '-10px', marginBottom: '20px' }}>How long will the public voting last?</div>
            <DurationInput onChange={val => updateForm({ period: val })} placeholder={3600} value={data.period}
                unit={data.periodUnit || 1}
                onChangeUnit={val => updateForm({ periodUnit: val })} />
        </div>
        <div className="form-group">
            <Label>Quorum</Label>
            <div className="Tip" style={{ marginTop: '-10px', marginBottom: '20px' }}>How many members are required to validate each proposal?</div>
            <Input placeholder={0} value={data.quorum} onChange={(e) => updateForm({ quorum: parseInt(e.target.value) })} type='number' />
        </div>
    </div>
}

export { VotingForm, useData };

