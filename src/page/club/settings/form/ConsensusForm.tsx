import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { update as reduxUpdateForm } from '../../../../config/redux/formSlice';
import { RootState, useChainId } from '../../../../config/store';
import MembershipCardInput from '../module/MembershipCardInput';
import './ConsensusForm.css';
import { Label } from '../../../../module/form';

const newMembership = (id) => {
    return {
        id,
        name: '',
        tokenAddress: '',
        defaultWeight: 1,
        editing: true
    }
}

const useData = () => {
    const formId = "consensus"
    const { form: formData } = useSelector((state: RootState) => state.form)
    const data: {
        membership: any
    } = formData && formData[formId] ? formData[formId] : { membership: [] }
    const dispatch = useDispatch()

    const updateMembership = (newValue) => {
        console.log(newValue)
        if (newValue?.id)
            update({
                membership: data.membership.map(m => {
                    if (m.id === newValue.id)
                        return newValue
                    else
                        return m
                })
            })
    }
    const removeMembership = (id) => {
        if (id)
            update({
                membership: data.membership.filter(m => {
                    return m.id !== id
                })
            })
    }
    const update = (newValue) => {
        dispatch(reduxUpdateForm({
            key: formId,
            value: Object.assign({}, data, newValue)
        }))
    }

    useEffect(() => {
        update({ membership: [] })
    }, [])

    return { formId, data, update, updateMembership, removeMembership }
}

const Form = React.forwardRef<any, any>((props, collectDataRef) => {
    const { display, errors } = props
    const {chainId} = useChainId()
    const { data, update: updateForm, updateMembership, removeMembership } = useData()
    // const [membershipList, setMembershipList] = useState([{ id: 1, editing: true }])
    const nftInputRefs = useRef([])

    const submitInputCardsData = useCallback(() => {
        let flag = true
        if (nftInputRefs.current?.length) {
            nftInputRefs.current.forEach(c => {
                let tmp = c && c()
                if (!tmp)
                    flag = false
            })
        }
        return flag
    }, [nftInputRefs])

    useEffect(() => {
        (collectDataRef as any).current = submitInputCardsData
    }, [submitInputCardsData, collectDataRef])

    const submitMembership = (data) => {
        if (data?.id) {
            updateMembership(Object.assign({}, data, { editing: false }))
        }
    }

    return <div>
        {
            errors.consensus && <p className="ErrorHint" style={{ fontSize: '20px' }}>{errors.consensus.error}</p>
        }
        <div className={"CreateClubForm" + (display ? '' : ' hidden')} style={{ padding: '40px 60px' }}>
            <Label style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>Membership</Label>
            {
                chainId !== '0x1' ? <div style={{ marginTop: '-10px', marginBottom: '30px', color: '#888' }}>Warning: You are creating DAO on Testnet</div> : null
            }
            {
                data.membership.map((m, i) => <MembershipCardInput
                    ref={nftInputRefs}
                    displayedId={i + 1} key={"MembershipCardInput" + m.id}
                    onSubmit={submitMembership}
                    onChange={updateMembership}
                    onDelete={removeMembership}
                    onEdit={id => {
                        if (submitInputCardsData()) {
                            setTimeout(() => {
                                let tmp = data.membership.map(m2 =>
                                    m2.id === id ?
                                        Object.assign({}, m2, { editing: true }) :
                                        Object.assign({}, m2, { editing: false })
                                )
                                updateForm({ membership: tmp })
                            }, 0);
                        }
                    }}
                    {...m}
                />)
            }

            <div className='addmorenftbutton' onClick={() => {
                if (submitInputCardsData()) {
                    setTimeout(() => {
                        let maxId = 1
                        data.membership.forEach(b => {
                            if (b.id > maxId)
                                maxId = b.id
                        });
                        updateForm({ membership: [...data.membership, newMembership(maxId + 1)] })
                    }, 0)
                }
            }}>
                <span style={{ transform: 'translateY(-1px)', fontSize: '20px' }}>+</span>&nbsp;&nbsp;Add membership
            </div>
        </div >

        {/* <div className={"CreateClubForm" + (display ? '' : ' hidden')} style={{ marginTop: '30px', minHeight: '160px' }}>
            <Label>Preview of membership</Label>
            <div style={{  color: 'rgb(187, 187, 187)'}}>There's none membership added</div>
        </div> */}
    </div>
})

export { Form as ConsensusForm, useData };
