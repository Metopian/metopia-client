import React from 'react'
import './MainButton.css'
const MainButton = (props) => {
    return <div className={"MainButton" + (props.solid ? ' solid' : '') + (props.disabled ? ' disabled' : '')} style={props.style}
        onClick={(e) => {
            if (!props.disabled)
                props.onClick(e)
        }} ><div className='MainButtonContainer'>{props.children}</div></div>
}


export default MainButton 