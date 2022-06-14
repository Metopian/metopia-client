import React from 'react'
import './HollowButton.css'
 const HollowButton = (props) => {
    return <div className={"HollowButton"} onClick={props.onClick} style={props.style}>{props.children}</div>
}

export default HollowButton