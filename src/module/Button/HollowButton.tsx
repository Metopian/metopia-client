import React from 'react'
import './HollowButton.scss'
 const HollowButton = (props) => {
    return <div className={"hollow-button"} onClick={props.onClick} style={props.style}>{props.children}</div>
}

export default HollowButton