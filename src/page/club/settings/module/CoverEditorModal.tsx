import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import React, { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import { HollowButton, MainButton } from '../../../../module/button';
import { getCroppedImg, type Area } from '../../../../utils/imageUtils';
import './CoverEditorModal.scss';

const coverEditorStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '752px', height: '661px',
        transform: 'translate(-50%, -50%)',
        background: '#FFFFFF',
        borderRadius: '32px',
        overflow: 'hidden'
    }
}

const CoverEditorModal = (props) => {
    const imageInput = useRef<HTMLInputElement | null>()
    const [mode, setMode] = useState(1)
    const [img, setImg] = useState<File | null>()
    const [scale, setScale] = useState(100)
    // const [mousePosition, setMousePosition] = useState([0, 0])
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()
    // const [croppedImage, setCroppedImage] = useState()

    const showCroppedImage = async () => {
        if (!img) {
            return
        }
        const croppedImage = await getCroppedImg(
            window.URL.createObjectURL(img),
            croppedAreaPixels
        )
        let blob = await fetch(croppedImage as string).then(r => r.blob());
        props.onSubmit(croppedImage, blob)
        props.onRequestClose()
    }

    return <Modal appElement={document.getElementById('root')}
        isOpen={props.show}
        onRequestClose={props.onRequestClose}
        style={coverEditorStyle}>
        <div className="cover-editor-modal-container">
            <div className="head">Edit cover image</div>

            <div className="ratio-selector-container">
                <div className="ratio-option" onClick={() => setMode(1)}>
                    <div className={"symbol" + (mode === 1 ? ' selected' : '')}>{mode === 1 ? <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/white_tick.svg" alt="Selected" /> : null}</div>
                    <div className="text">
                        <div className="title">Club Information Page(4:1)</div>
                        <div className="content">Users will see it in club details page</div>
                    </div>
                </div>
            </div>
            <div className={"main-container" + (img ? '' : ' empty')}
                onClick={() => {
                    if (!img && imageInput.current) imageInput.current.click()
                }}
            >
                <Cropper
                    style={{
                        containerStyle: { backgroundColor: 'rgba(255,255,255,0.6)' }, mediaStyle: { backgroundColor: 'rgba(255,255,255,1)' },
                    }}
                    // showGrid={false}
                    image={img && window.URL.createObjectURL(img)}
                    crop={crop}
                    // cropSize={{ width: 672, height: 168 }}
                    zoom={scale / 100}
                    // restrictPosition={true}
                    aspect={4}
                    onCropChange={(v) => {
                        setCrop(v)
                    }}
                    onCropComplete={(croppedArea, croppedAreaPixels) => {
                        setCroppedAreaPixels(croppedAreaPixels)
                    }}
                    objectFit="auto-cover"
                    onZoomChange={setScale}
                />
                <input className='Hidden' type={'file'} ref={imageInput} onBlur={() => { console.log("blur") }} onChange={(e) => {
                    if (e.target.files[0]) {
                        setCrop({ x: 0, y: 0 })
                        setCroppedAreaPixels(null)
                        // setCroppedImage(null)
                        setImg(e.target.files[0])
                    }
                }} />
                {img ? null : <img className="uploader-icon" src={"https://metopia.oss-cn-hongkong.aliyuncs.com/upload.svg"} alt='Upload' />}
            </div>
            <div className="slider-container"  >
                <div className="wrapper">
                    <Slider min={50} max={150} step={1} onChange={(value) => value !== 100 && setScale(value)} defaultValue={scale}
                        trackStyle={{ backgroundColor: '#5A49DE', height: '6px' }}
                        railStyle={{ height: '6px', background: '#F8F7FC' }}
                        handleStyle={{
                            width: '20px', border: '0', marginTop: '-7px', height: '20px', borderRadius: '10px',
                            background: '#FFFFFF',
                            boxShadow: '0px 0.357143px 2.85714px rgba(72, 69, 94, 0.24), 0px 4.28571px 9.28571px rgba(72, 69, 94, 0.12)'
                        }} />
                </div>
            </div>
            <div className="button-container">
                <HollowButton style={{ marginRight: '20px' }} onClick={() => {
                    imageInput.current.click()
                }}>Reset</HollowButton>
                <MainButton solid onClick={showCroppedImage}>Apply</MainButton>
            </div>
        </div>
    </Modal>
}



export default CoverEditorModal