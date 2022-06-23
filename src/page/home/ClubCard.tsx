import React from 'react'
import { localRouter } from '../../config/urls'
import { WrappedLazyLoadImage } from '../../module/image'
import './ClubCard.scss'
const ClubCard = (props) => {
    return <div className='club-card' key={'clubcard' + props.id} onClick={() => window.location.href = localRouter('club.prefix') + props.slug} >
        <div className="wrapper">
            <WrappedLazyLoadImage className="bg" src={props.avatar || "/imgs/example_cover_large.png"} alt="" />
            <div className={'text-container'} >
                    <div className="name">{props.name}</div>
            </div>
        </div>
    </div>
}
export default ClubCard