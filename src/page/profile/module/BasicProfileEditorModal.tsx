import React, { useState, useCallback } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { hideUserProfileEditorModal } from '../../../config/redux/modalControllerSlice';
import { RootState } from '../../../config/store';
import { MainButton } from '../../../module/button';
import { Label, Textarea, Input } from '../../../module/form';
import './BasicProfileEditorModal.scss';
import { updateAccount } from '../../../core/account';
import { json } from 'stream/consumers';

const tmpstyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '560px',
        height: '580px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '32px',
        padding: 0,
        overflow: 'hidden',
        position: 'absolute'
    }
}

const BasicProfileEditorModal = props => {
    const { isShow, user } = useSelector((state: RootState) => state.modalController.userProfileEditorModal)
    const dispatch = useDispatch()

    const [username, setUsername] = useState(user?.username)
    const [introduction, setIntroduction] = useState(user?.introduction)

    const updateUser = () => {
        const tmp = Object.assign({}, user, { username, introduction })
        return updateAccount(tmp.owner, tmp.username, tmp.avatar, tmp.introduction)
    }

    return <Modal
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={() => dispatch(hideUserProfileEditorModal())}
        style={tmpstyle} className="user-basic-profile-editor-modal">
        <div className="container">
            <div className="head">
                <div className='title'>Update profile</div>
                <img src="/imgs/close.svg" alt="X"/>
            </div>
            <div className='form-group'>
                <Label>Username</Label>
                <Input defaultValue={user?.username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className='form-group'>
                <Label>Introduction</Label>
                <Textarea defaultValue={user?.introduction} onChange={e => setIntroduction(e.target.value)} maxLength={120} />
            </div>
            <MainButton onClick={(e) => {
                return updateUser().then(() => dispatch(hideUserProfileEditorModal())).catch(e => {
                    console.error(e)
                    alert("Failed")
                })
            }}>Submit</MainButton>
        </div>
    </Modal>

}

export default BasicProfileEditorModal