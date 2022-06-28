import React, { useRef, useState, useMemo } from 'react';
import ReactLoading from 'react-loading';
import { toFixedIfNecessary } from '../../utils/numberUtils';
import { WrappedLazyLoadImage } from '../image';
import './index.scss';

const Label = (props) => {
    return <div className={'r-label ' + (props.className ? props.className : "")}
        style={props.style}  >{props.children}</div>
}

const Input = (props) => {
    return <input  {...props} className={'r-input ' + (props.className ? props.className : "")} />
}

const Textarea = (props) => {
    const [len, setLen] = useState(0)
    return <div className={'r-textarea ' + (props.className ? props.className : "")}>
        <textarea
            placeholder={props.placeholder} style={props.style}
            onChange={(e) => {
                setLen(e.target.value.length)
                props.onChange && props.onChange(e)
            }} value={props.value}></textarea>
        {
            props.maxLength ? <div className={"length-indicator" + (len > props.maxLength ? ' exceeded' : '')}>{len}/{props.maxLength}</div> : null
        }
    </div>
}

const ImageSelector = (props) => {
    const inputRef = useRef<any>()
    const [loading, setLoading] = useState(false)
    let sizeClass = props.size ? ' ' + props.size : ''
    return <div className={"r-image-uploader " + (props.wide ? 'wide' : 'square') + sizeClass} style={props.style}>
        <div className={"mask" + (props.imgUrl ? '' : ' empty')} onClick={() => {
            if (loading)
                return
            inputRef.current.click()
        }}>
            {props.imgUrl ? <WrappedLazyLoadImage className="selected-image" src={props.imgUrl} alt='' /> :
                <img className={"to-upload-icon" + (loading ? ' hidden' : '')} src={"https://metopia.oss-cn-hongkong.aliyuncs.com/upload.svg"} alt='Upload' />}
        </div>
        {
            loading ? <ReactLoading type={'spin'} color={'#444'} height={'40%'} width={'40%'} className="loading" /> : null
        }
        <input type='file' className="Hidden" ref={inputRef}
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
    return <select className="r-select" onChange={onChange} defaultValue={defaultValue}>
        {
            options.map(op => {
                return <option key={keyid + "-" + op.value} value={op.value} className="r-option">{op.text}</option>
            })
        }
    </select>
}


const MultiSelect = (props: { keyid, options, value?, onChange?, style?, defaultValue?}) => {
    const { keyid, options, onChange, style, value, defaultValue } = props
    const [selectedOptions, setSelectedOptions] = useState(defaultValue || [])
    if (!options || options.length === 0)
        return null

    return <div style={style} className="r-multi-select">
        {(value || selectedOptions).length > 0 ?
            <div className="card-wrapper">
                {
                    (value || selectedOptions).map((sop, i) => {
                        return <div className='card' key={'r-multi-select-card' + i}>
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
        <select className="selector" onChange={e => {
            setSelectedOptions([...(value || selectedOptions), options.find(op => op.value === e.target.value)])
            onChange([...(value || selectedOptions), options.find(op => op.value === e.target.value)])
        }}>
            {
                options.filter(op => !(value || selectedOptions).find(sop => sop.value === op.value)).map(op => {
                    return <option key={keyid + "-" + op.value} value={op.value} className="r-option" onClick={() => {
                        setSelectedOptions([...(value || selectedOptions), op])
                        onChange([...(value || selectedOptions), op])
                    }}>{op.text}</option>
                })
            }
        </select>
    </div>
}

export const UNIT_SECOND = 1
export const UNIT_HOUR = 3600
export const UNIT_DAY = 86400
export const UNIT_MONTH = 2592000
export const UNIT_YEAR = 31104000
export const unitNumToText = (num) => {
    if (num === 1)
        return 'seconds'
    else if (num === 3600)
        return 'hours'
    else if (num === 86400)
        return 'days'
    else if (num === 2592000)
        return 'months'
    else if (num === 31104000)
        return 'years'
    return ''
}
export const unitTextToNum = (text) => {
    if (!text)
        return 0
    if (text.indexOf('second') === 0)
        return 1
    else if (text.indexOf('hour') === 0)
        return 3600
    else if (text.indexOf('day') === 0)
        return 86400
    else if (text.indexOf('month') === 0)
        return 2592000
    else if (text.indexOf('year') === 0)
        return 31104000
}

const DurationInput = (props: { onChange, value, onChangeUnit, unit?: number, placeholder?: number, unitRange?: number[] }) => {
    const { placeholder, value, onChange, unit, unitRange } = props
    const options = useMemo(() => {
        return (unitRange || [1, 3600, 86400]).map(num => {
            return <option value={num} key={"duration-input" + num}>{unitNumToText(num)}</option>
        })
    }, [unitRange])

    return <div className="r-input-duration">
        <Input placeholder={placeholder} type='number'
            value={toFixedIfNecessary(value / unit, 2)}
            onChange={e => {
                let tmpVal = parseFloat(e.target.value)
                if (tmpVal > 0) {
                    onChange(tmpVal * unit)
                } else {
                    return false
                }
            }} />
        <select onChange={e => {
            let tmpUnit = parseInt(e.target.value)
            onChange(Math.round(value * unit / tmpUnit))
            props.onChangeUnit && props.onChangeUnit(tmpUnit)
        }} className='' value={unit} >
            {options}
        </select>
    </div>
}


export { Label, Input, Textarea, ImageSelector, Select, MultiSelect, DurationInput };

