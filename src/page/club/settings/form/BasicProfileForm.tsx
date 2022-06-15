import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { update as updateForm } from '../../../../config/redux/formSlice';
import { RootState } from '../../../../config/store';
import { GhostButtonGroup } from '../../../../module/button';
import { ImageSelector, Input, Label, Textarea } from '../../../../module/form';
import { updateImgToIfps } from '../../../../utils/imageUtils';
import CoverEditorModal from '../module/CoverEditorModal';
import './BasicProfileForm.css';

const linkInputModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '520px',
        // height: '661px',
        transform: 'translate(-50%, -50%)',
        background: '#FFFFFF',
        borderRadius: '32px',
        overflow: 'hidden'
    }
}
const stepConfig = [
    {
        title: 'Website',
        icon: '/imgs/website.svg'
    }, {
        title: 'Discord',
        icon: '/imgs/discord_purple.svg'
    }, {
        title: 'Twitter',
        icon: '/imgs/twitter_purple.svg'
    }
]

const StepIcon = (props) => {
    return <div className={"StepIcon" + (props.active ? ' active' : '')} onClick={props.onClick}>
        <div className="StepIconWrapper"><img src={props.icon} alt={props.title} /></div>
        <div className="StepIconTitle">{props.title}</div>
    </div>
}

const LinkInputModal = (props) => {
    const { display, onHide, formLabel, formInput, formInputSetting, value } = props

    return <Modal appElement={document.getElementById('root')}
        isOpen={display}
        onRequestClose={onHide}
        style={linkInputModalStyle}>
        <div className="LinkInputModalContainer">
            <div className="CreateClubPageTitle" style={{ marginBottom: 0, paddingLeft: '20px' }}>Link</div>
            <div className={"LinkInputModalStepInfoContainer"}>
                {stepConfig.map((stepInfo, i) => <StepIcon key={"stepicon" + i} title={stepInfo.title} icon={stepInfo.icon} active={formLabel === stepInfo.title}
                    onClick={() => { props.setEditingLink(stepInfo.title) }} />)}
            </div>
            <div className='LinkInputModalInputWrapper'>
                <label>{formLabel}</label>
                {formInput}
                {
                    formInputSetting ?
                        <input {...formInputSetting} className="RInput" value={value} /> : null
                }
            </div>
        </div>
    </Modal>
}

// const useData
const useData = () => {
    const formId = "basicinfo"
    const { form: formData } = useSelector((state: RootState) => state.form)
    const data = formData && formData[formId] ? formData[formId] : {
        name: '', introduction: '', website: '', discord: '', twitter: '', avatar: '', banner: ''
    }
    const dispatch = useDispatch()
    // const [data, setData] = useState({ name: '', introduction: '', website: '', discord: '', twitter: '' })

    const update = (newValue) => {
        dispatch(updateForm({
            key: formId,
            value: Object.assign({}, data, newValue)
        }))
    }

    useEffect(() => {
        update({ name: '', introduction: '', website: '', discord: '', twitter: '', avatar: '', banner: '' })
    }, [])

    return { formId, data, update }
}

const Form = props => {
    const { display, errors } = props
    const imageInput = useRef<HTMLInputElement | null>()
    const [logoImg, setLogoImg] = useState<File | null>()
    const [selectingCover, setSelectingCover] = useState<boolean>(false)
    const [croppedBanner, setCroppedBanner] = useState()
    const { data, update: updateForm } = useData()
    const [editingLinkLabel, setEditingLinkLabel] = useState<any>(null)
    
    return <div className={"CreateClubForm" + (display ? '' : ' hidden')}>
        <div className="CreateClubPageFormContainerLeft">
            <div className="CreateClubPageFormGroup">
                <Label>Name</Label>
                <Input placeholder={""}
                    value={data.name}
                    onChange={e => { updateForm({ name: e.target.value }) }} className={errors?.name ? 'error' : ''} />
                {errors.name && <p className="ErrorHint">{errors.name}</p>}
            </div>
            <div className="CreateClubPageFormGroup">
                <Label>Introduction</Label>
                <Textarea placeholder={""} maxLength={200} onChange={(e) => updateForm({ introduction: e.target.value })}
                    value={data.introduction} />
            </div>
            <div className="CreateClubPageFormGroup">
                <Label>Link</Label>

                <GhostButtonGroup items={[
                    {
                        content: <img src={'/imgs/website.svg'} alt="website" style={{ width: '24px', height: '24px' }} />,
                        onClick: () => setEditingLinkLabel('website'),
                        active: editingLinkLabel === 'website'
                    }, {
                        content: <img src={'/imgs/opensea.svg'} alt="website" style={{ width: '24px', height: '24px' }} />,
                        onClick: () => setEditingLinkLabel('opensea'),
                        active: editingLinkLabel === 'opensea'
                    },
                    {
                        content: <img src={'/imgs/discord_purple.svg'} alt="discord" style={{ width: '24px', height: '24px' }} />,
                        onClick: () => setEditingLinkLabel('discord'),
                        active: editingLinkLabel === 'discord'
                    },
                    {
                        content: <img src={'/imgs/twitter_purple.svg'} alt="twitter" style={{ width: '24px', height: '24px' }} />,
                        onClick: () => setEditingLinkLabel('twitter'),
                        active: editingLinkLabel === 'twitter'
                    }
                ]} />

                <div className={"subgroup" + (editingLinkLabel === 'website' ? '' : ' hidden')}>
                    <Label style={{}}>Website</Label>
                    <Input placeholder={"https://"} value={data.website} onChange={e => {
                        updateForm({ website: e.target.value })
                    }} />
                </div><div className={"subgroup" + (editingLinkLabel === 'opensea' ? '' : ' hidden')}>
                    <Label style={{}}>Opensea</Label>
                    <Input placeholder={"https://"} value={data.opensea} onChange={e => {
                        updateForm({ opensea: e.target.value })
                    }} />
                </div><div className={"subgroup" + (editingLinkLabel === 'discord' ? '' : ' hidden')}>
                    <Label style={{}}>Discord</Label>
                    <Input placeholder={"https://"} value={data.discord} onChange={e => {
                        updateForm({ discord: e.target.value })
                    }} />
                </div><div className={"subgroup" + (editingLinkLabel === 'twitter' ? '' : ' hidden')}>
                    <Label style={{}}>Twitter</Label>
                    <Input placeholder={"https://"} value={data.twitter} onChange={e => {
                        updateForm({ twitter: e.target.value })
                    }} />
                </div>
            </div>
        </div>
        <div className="CreateClubPageFormContainerRight">
            <div className="CreateClubPageFormGroup">
                <Label>Profile Image</Label>
                <ImageSelector trigger={() => { imageInput.current.click() }} imgUrl={(logoImg && window.URL.createObjectURL(logoImg)) || data.avatar} />
                <input type='file' className="HiddenInput" ref={imageInput}
                    onChange={async (e) => {
                        let result = await updateImgToIfps(e.target.files[0])
                        if (!result.IpfsHash) {
                            window.alert("Image upload failed. Please check your network.")
                            return
                        }
                        setLogoImg(e.target.files[0])
                        updateForm({ 'avatar': "ipfs://" + result.IpfsHash })
                    }}
                    accept='image/*' />
            </div>
            <div className="CreateClubPageFormGroup">
                <Label>Cover Image</Label>
                <ImageSelector wide trigger={() => { setSelectingCover(true) }} imgUrl={croppedBanner} />
                <CoverEditorModal onRequestClose={() => setSelectingCover(false)} show={selectingCover} onSubmit={async (croppedImage, blob) => {
                    let result = await updateImgToIfps(blob)
                    if (!result.IpfsHash) {
                        window.alert("Image upload failed. Please check your network.")
                        return
                    }

                    updateForm({ 'banner': "ipfs://" + result.IpfsHash })
                    setCroppedBanner(croppedImage)
                }} />
            </div>
        </div>
        {/* <LinkInputModal display={showLinkInputModal} onHide={() => setShowLinkInputModal(false)} formInput={editingFormInput}
            formLabel={editingLinkLabel} formInputSetting={editingLinkInputSetting} setEditingLink={setEditingLink} /> */}
    </div>

}

export { Form as BasicProfileForm, useData };

