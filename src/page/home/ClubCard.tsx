import React from 'react'
import { localRouter } from '../../config/urls'
import { WrappedLazyLoadImage } from '../../module/image'
import './ClubCard.css'
const ClubCard = (props) => {
    return <div className='ClubCard' key={'clubcard' + props.id} onClick={() => window.location.href = localRouter('club.prefix') + props.slug} >
        <div className="ClubCardBgWrapper">
            <WrappedLazyLoadImage className="ClubCardBg" src={props.avatar || "/imgs/example_cover_large.png"} alt="" />
            {/* <img src={props.coverUrl} className="ClubCardBg" alt="" /> */}
            <div className={'ClubCardContent ' + (props.avatar || true ? '' : 'puretext')} >
                {/* {props.avatar ? <WrappedLazyLoadImage className="ClubCardLogo" src={props.avatar} alt="" /> : null} */}
                <div className="ClubCardTextInfo">
                    <div className="ClubCardName">{props.name}</div>
                    {/* <div className="ClubCardMember">{numberToLetter(props.memberCount)} Members</div> */}
                </div>
            </div>
        </div>
    </div>
}
export default ClubCard