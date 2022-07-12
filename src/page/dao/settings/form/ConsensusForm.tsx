import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { update as reduxUpdateForm } from '../../../../config/redux/formSlice';
import { RootState, useChainId } from '../../../../config/store';
import { Label } from '../../../../module/form';
import MembershipCardInput from '../module/MembershipCardInput';

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
    const update = useCallback((newValue) => {
        dispatch(reduxUpdateForm({
            key: formId,
            value: newValue
        }))
    }, [dispatch])

    return { formId, data, update, updateMembership, removeMembership }
}

const Form = React.forwardRef<any, any>((props, collectDataRef) => {
    const { errors } = props
    const { chainId } = useChainId()
    const { data, update: updateForm, updateMembership, removeMembership } = useData()
    const nftInputRefs = useRef([])

    const submitInputCardsData = useCallback(() => {
        let flag = true
        if (nftInputRefs.current?.length) {
            nftInputRefs.current.forEach(c => {
                if (c && !c()) {
                    flag = false
                }
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

    return <div className={"create-dao-form"} style={{ padding: '40px 60px' }}>
        {errors.consensus && <div className="ErrorHint" >{errors.consensus}</div>}
        <Label style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>Voting power</Label>
        <div className="Tip" style={{ marginTop: '-10px', marginBottom: '30px' }}>How to calculate voting power?</div>
        {
            chainId !== '0x1' ? <div className="Tip" style={{ marginTop: '-10px', marginBottom: '30px' }}>Warning: You are creating DAO on Testnet</div> : null
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

        <div className='add-more-nft-button' onClick={() => {
            if (submitInputCardsData()) {
                setTimeout(() => {
                    let maxId = 0
                    data.membership.forEach(b => {
                        if (b.id > maxId)
                            maxId = b.id
                    });
                    updateForm({
                        membership: [...(data.membership.map(m => {
                            return Object.assign({}, m, { editing: false })
                        })), newMembership(maxId + 1)]
                    })
                }, 0)
            }
        }}>
            <span style={{ transform: 'translateY(-1px)', fontSize: '20px' }}>+</span>&nbsp;&nbsp;Add strategy
        </div>
    </div >

})

export { Form as ConsensusForm, useData };

