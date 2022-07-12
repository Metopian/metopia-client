import React, { useState } from 'react'
import { Input } from '../../../../module/form'
import './AdminInputCard.scss'
import { DefaultAvatar, DefaultAvatarWithRoundBackground } from '../../../../module/image'

const AdminInputCard = props => {
    const { disabled, data, onChange, onDelete } = props
    const [editing, setEditing] = useState(false)
    return <div className={'admin-input-card' + (!disabled && (editing || (!data.address?.length)) ? ' editing' : ' not-editing')}>
        <DefaultAvatarWithRoundBackground height={24} wallet={data.address} className="avatar" />
        <Input
            disabled={disabled}
            value={data.address}
            onFocus={e => setEditing(true)}
            onChange={e => {
                onChange(e.target.value)
            }} onBlur={e => setEditing(false)} />
        {
            !disabled ?
                <img src="/imgs/close_purple4.svg" alt="del" className='del-button' onClick={onDelete} /> : null
        }
    </div>
}

export default AdminInputCard