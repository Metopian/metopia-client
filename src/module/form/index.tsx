import React, { useRef, useState } from 'react';
import ReactLoading from 'react-loading';
import { WrappedLazyLoadImage } from '../image';
import './index.css';

const Label = (props) => {
    return <div className={'RLabel ' + (props.className ? props.className : "")}
        style={props.style}  >{props.children}</div>
}

const Input = (props) => {
    return <input  {...props} className={'RInput ' + (props.className ? props.className : "")} />
}

const Textarea = (props) => {
    const [len, setLen] = useState(0)
    return <div className={'RTextarea ' + (props.className ? props.className : "")}><textarea
        placeholder={props.placeholder} style={props.style}
        onChange={(e) => {
            setLen(e.target.value.length)
            props.onChange && props.onChange(e)
        }} value={props.value}></textarea>
        {
            props.maxLength ? <div className={"LengthIndicator" + (len > props.maxLength ? ' exceeded' : '')}>{len}/{props.maxLength}</div> : null
        }
    </div>
}

const ImageSelector = (props) => {
    const inputRef = useRef<any>()
    const [loading, setLoading] = useState(false)
    let sizeClass = props.size ? ' ' + props.size : ''
    return <div className={"RImageUploader " + (props.wide ? 'wide' : 'square') + sizeClass} style={props.style}>
        <div className={"RImageUploaderMask" + (props.imgUrl ? '' : ' empty')} onClick={() => {
            if (loading)
                return
            inputRef.current.click()
        }}>
            {props.imgUrl ? <WrappedLazyLoadImage className="RImageUploaderImg" src={props.imgUrl} alt='' /> :
                <img className={"RImageUploaderIcon" + (loading ? ' hidden' : '')} src={"https://metopia.oss-cn-hongkong.aliyuncs.com/upload.svg"} alt='Upload' />}
        </div>
        {
            loading ? <ReactLoading type={'spin'} color={'#444'} height={'40%'} width={'40%'} className="loading" /> : null
        }
        <input type='file' className="HiddenInput" ref={inputRef}
            onChange={async (e) => {
                setLoading(true)
                await props.onChange(e)
                setLoading(false)
            }}
            accept='image/*' />
    </div >
}

const Select = (props: { keyid, options, onChange?, defaultValue?}) => {
    const { keyid, options, onChange, defaultValue } = props
    if (!options || options.length === 0)
        return null
    return <select className="RSelect" onChange={onChange} defaultValue={defaultValue}>
        {
            options.map(op => {
                return <option key={keyid + "-" + op.value} value={op.value} className="ROption">{op.text}</option>
            })
        }
    </select>
}


const MultiSelect = (props: { keyid, options, value?, onChange?, style?, defaultValue?}) => {
    const { keyid, options, onChange, style, value, defaultValue } = props
    const [selectedOptions, setSelectedOptions] = useState(defaultValue || [])
    if (!options || options.length === 0)
        return null

    return <div style={style}>
        {(value || selectedOptions).length > 0 ?
            <div className="RMultiSelectCardWrapper">
                {
                    (value || selectedOptions).map((sop, i) => {
                        return <div className='RMultiSelectCard' key={'RMultiSelectCard' + i}>
                            <span>{sop.text}</span>
                            <img src="/imgs/close.svg" alt="" onClick={e => {
                                let tmp = (value || selectedOptions).filter(op => op.value !== sop.value)
                                onChange(tmp)
                                setSelectedOptions(tmp)
                            }} /></div>
                    })
                }
            </div> :
            null}
        <select className="RMultiSelect" onChange={e => {
            setSelectedOptions([...(value || selectedOptions), options.find(op => op.value === e.target.value)])
            onChange([...(value || selectedOptions), options.find(op => op.value === e.target.value)])
        }}>
            {
                options.filter(op => !(value || selectedOptions).find(sop => sop.value === op.value)).map(op => {
                    return <option key={keyid + "-" + op.value} value={op.value} className="ROption" onClick={() => {
                        setSelectedOptions([...(value || selectedOptions), op])
                        onChange([...(value || selectedOptions), op])
                    }}>{op.text}</option>
                })
            }
        </select>
    </div>
}





export { Label, Input, Textarea, ImageSelector, Select, MultiSelect };

