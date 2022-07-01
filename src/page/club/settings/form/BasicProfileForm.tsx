import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { update as updateForm } from '../../../../config/redux/formSlice';
import { RootState } from '../../../../config/store';
import { GhostButtonGroup } from '../../../../module/button';
import { ImageSelector, Input, Label, Textarea } from '../../../../module/form';
import { uploadFileToIfps } from '../../../../utils/ipfsUtils';
import { max } from '../../../../utils/numberUtils';
import { getAddress } from '../../../../utils/web3Utils';
import AdminInputCard from '../module/AdminInputCard';
import CoverEditorModal from '../module/CoverEditorModal';
import './BasicProfileForm.scss';

const useData = () => {
    const formId = "basicinfo"
    const { form: formData } = useSelector((state: RootState) => state.form)
    const data = formData && formData[formId] ? formData[formId] : {
        name: '', introduction: '', website: '', discord: '', opensea: '', twitter: '', avatar: '', banner: '', admins: []
    }
    const dispatch = useDispatch()

    const update = (newValue) => {
        dispatch(updateForm({
            key: formId,
            value: Object.assign({}, data, newValue)
        }))
    }

    useEffect(() => {
        update({ name: '', introduction: '', website: '', discord: '', opensea: '', twitter: '', avatar: '', banner: '', admins: [] })
    }, [])

    return { formId, data, update }
}

const Form = props => {
    const { errors } = props
    const imageInput = useRef<HTMLInputElement | null>()
    const [logoImg, setLogoImg] = useState<File | null>()
    const [selectingCover, setSelectingCover] = useState<boolean>(false)
    const [croppedBanner, setCroppedBanner] = useState()
    const { data, update: updateForm } = useData()
    const [editingLinkLabel, setEditingLinkLabel] = useState<any>(null)
    const [self, setSelf] = useState(null)

    useEffect(() => {
        getAddress().then(addr => {
            setSelf(addr)
            updateForm({ admins: [{ address: addr, id: 1 }] })
        })
    }, [])

    return <div className={"create-club-form"}>
        <div className="left-container">
            <div className="form-group">
                <Label>Name</Label>
                <Input placeholder={""}
                    value={data.name}
                    onChange={e => { updateForm({ name: e.target.value }) }} className={errors?.name ? 'error' : ''} />
                {errors.name && <p className="ErrorHint">{errors.name}</p>}
            </div>
            <div className="form-group">
                <Label>Introduction</Label>
                <Textarea placeholder={""} maxLength={200} onChange={(e) => updateForm({ introduction: e.target.value })}
                    value={data.introduction} />
            </div>
            <div className="form-group">
                <Label>Admins</Label>
                {
                    data.admins.map(admin => {
                        return <AdminInputCard key={'AdminInputCard' + admin.id} data={admin} onChange={(val) => {
                            updateForm({ admins: data.admins.map(tmp => tmp.id === admin.id ? Object.assign({}, admin, { address: val }) : tmp) })
                        }}
                            onDelete={e => updateForm({ admins: data.admins.filter(tmp => tmp.id !== admin.id || tmp.id === 1) })}
                            disabled={admin.id === 1}
                        />
                    })
                }
                <div className='add-admin-button-wrapper'>
                    <img src="/imgs/addbuttonround.png" alt="add" className='add-admin-button' onClick={e => {
                        if (!data.admins.find(ad => ad.address.trim().length === 0)) {
                            let maxId = max(data.admins, 'id')
                            updateForm({ admins: [...data.admins, { address: '', id: maxId + 1 }] })
                        }
                    }} />
                </div>
            </div>
        </div>
        <div className="right-container">
            <div className="form-group">
                <Label>Profile Image</Label>
                <ImageSelector trigger={() => { imageInput.current.click() }}
                    imgUrl={(logoImg && window.URL.createObjectURL(logoImg)) || data.avatar} onChange={async (e) => {
                        let result = await uploadFileToIfps(e.target.files[0])
                        if (!result.IpfsHash) {
                            window.alert("Image upload failed. Please check your network.")
                            return
                        }
                        setLogoImg(e.target.files[0])
                        updateForm({ 'avatar': "ipfs://" + result.IpfsHash })
                    }} />
            </div>
            <div className="form-group">
                <Label>Cover Image</Label>
                <ImageSelector wide trigger={() => { setSelectingCover(true) }} imgUrl={croppedBanner && window.URL.createObjectURL(croppedBanner)}
                    onChange={async (e) => {
                        let result = await uploadFileToIfps(e.target.files[0])
                        if (!result.IpfsHash) {
                            window.alert("Image upload failed. Please check your network.")
                            return
                        }
                        setCroppedBanner(e.target.files[0])
                        updateForm({ 'banner': "ipfs://" + result.IpfsHash })
                    }} />
                <CoverEditorModal onRequestClose={() => setSelectingCover(false)} show={selectingCover} onSubmit={async (croppedImage, blob) => {
                    let result = await uploadFileToIfps(blob)
                    if (!result.IpfsHash) {
                        window.alert("Image upload failed. Please check your network.")
                        return
                    }

                    updateForm({ 'banner': "ipfs://" + result.IpfsHash })
                    setCroppedBanner(croppedImage)
                }} />
            </div>
            <div className="form-group">
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
    </div>

}

export { Form as BasicProfileForm, useData };

