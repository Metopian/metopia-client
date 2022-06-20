import React, { useRef, useState, useMemo } from 'react';
import ReactLoading from 'react-loading';
import { toFixedIfNecessary } from '../../utils/numberUtils';
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


export const UNIT_SECOND = 1
export const UNIT_HOUR = 3600
export const UNIT_DAY = 86400
export const UNIT_MONTH = 2592000
export const UNIT_YEAR = 31104000

const DurationInput = (props: { onChange, value, placeholder?: number, defaultUnit?: number, unitRange?: number[] }) => {
    const { placeholder, value, onChange, defaultUnit, unitRange } = props
    // const [value, setValue] = useState(defaultValue || 0)
    const [unit, setUnit] = useState(defaultUnit || 1)

    const options = useMemo(() => {
        return (unitRange || [1, 3600, 86400]).map(num => {
            let text = ''
            if (num === 1)
                text = 'seconds'
            else if (num === 3600)
                text = 'hours'
            else if (num === 86400)
                text = 'days'
            else if (num === 2592000)
                text = 'months'
            else if (num === 31104000)
                text = 'years'
            return <option value={num} key={"DurationInput" + num}>{text}</option>
        })
    }, [unitRange])

    return <div className="DurationInput">
        <Input placeholder={placeholder} type='number' value={toFixedIfNecessary(value/unit, 2)}
            onChange={e => {
                let tmpVal = parseFloat(e.target.value)
                if (tmpVal > 0) {
                    console.log(tmpVal * unit)
                    onChange(tmpVal * unit)
                } else {
                    return false
                }
            }} />
        <select onChange={e => {
            let tmpUnit = parseInt(e.target.value)
            onChange(Math.round(value * unit / tmpUnit))
            setUnit(tmpUnit)
        }} className='' defaultValue={1}>
            {
                options
            }
            {/* <option value={1}>seconds</option>
            <option value={3600}>hours</option>
            <option value={86400}>days</option> */}
        </select>
    </div>
}


export { Label, Input, Textarea, ImageSelector, Select, MultiSelect, DurationInput };

