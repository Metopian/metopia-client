import React, { useState } from 'react'
import './GhostButton.scss'

const GhostButton = (props) => {
    const [hover, setHover] = useState(false)
    return <div className={'ghost-button' + (hover || props.active ? ' active' : '')}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onClick={props.onClick}>
        {props.activeContent && hover ? props.activeContent : props.content}
    </div>
}

const GhostButtonGroup = (props) => {
    if (!props.items?.length)
        return null

    return <div className='ghost-button-group' style={props.style}>
        {props.items.map((i, j) => {
            return <GhostButton key={'GhostButton-' + j} active={i.active}
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
