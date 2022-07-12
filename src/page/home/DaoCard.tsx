import React from 'react'
import { localRouter } from '../../config/urls'
import { WrappedLazyLoadImage } from '../../module/image'
import './DaoCard.scss'
const DaoCard = (props) => {
    return <div className='dao-card' key={'dao-card' + props.id} onClick={() => window.location.href = localRouter('dao.prefix') + props.slug} >
        <div className="wrapper">
            <WrappedLazyLoadImage className="bg" src={props.avatar || "/imgs/example_cover_large.png"} alt="" />
            <div className={'text-container'} >
                    <div className="name">{props.name}</div>
            </div>
        </div>
    </div>
}
export default DaoCard