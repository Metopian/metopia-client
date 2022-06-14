import React, { useState } from 'react'
import './GhostButton.css'

const GhostButton = (props) => {
    const [hover, setHover] = useState(false)
    return <div className={'GhostButton' + (props.left ? ' left' : '') +
        (props.right ? ' right' : '') + (hover || props.active ? ' active' : '')}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onClick={props.onClick}>
        {props.activeContent && hover ? props.activeContent : props.content}
    </div>
}

const GhostButtonGroup = (props) => {
    if (!props.items?.length)
        return null

    return <div className='GhostButtonGroup' style={props.style}>
        {props.items.map((i, j) => {
            return <GhostButton key={'GhostButton-' + j} active={i.active} left={j === 0} right={j === props.items.length - 1}
                content={i.content} activeContent={i.activeContent} onClick={() => {
                    if (i.link) window.location.href = i.link
                    if (i.onClick) i.onClick()
                }
                } />
        })}
    </div>
}
export default GhostButton
export { GhostButtonGroup }
