import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../config/redux/userSlice'
import { RootState, useChainId } from '../../config/store'
import { OnClickFuncType } from '../../config/type/docTypes'
import { cdnPrefix, localRouter } from '../../config/urls'
import { getNFTReadableSrc } from '../../utils/NftUtils'
import { getAddress } from '../../utils/web3Utils'
import { useLoginModal } from '../LoginModal'
import { switchChain } from '../../utils/web3Utils'
import './index.scss'

const LogoIcon = (props: { src: string, onClick?: OnClickFuncType }) => {
    return <div className={"logo-icon-wrapper"} onClick={props.onClick || function () { window.location.href = localRouter('home') }}>
        <img src={props.src} alt='' />
    </div >
}

const MenuItem = (props: { icon: string, name: string, link?: string, isIcon?: boolean, onClick?: OnClickFuncType, fill?: boolean }) => {
    const { icon, name, link, isIcon, fill } = props
    return <div className={"menu-item" + (isIcon ? ' isIcon' : '') + (fill ? ' fill' : '')} onClick={(e) => {
        if (props.onClick)
            props.onClick(e)
        else if (link) window.location.href = link
    }}>
        {
            <img src={icon} title={name} alt={name} />
        }
    </div >
}

const menuItems = [
    {
        id: 'user',
        icon: cdnPrefix + 'profile.svg',
        name: 'Profile',
        loginRequired: true,
        link: localRouter('profile'),
        isIcon: false
    }, {
        icon: cdnPrefix + 'stats.svg',
        name: 'Billboard',
        isIcon: true,
        link: localRouter('home'),
    }, {
        icon: cdnPrefix + 'add.svg',
        name: 'Add',
        link: localRouter('dao.create'), isIcon: true
    }
]

const Menu = (props) => {
    const { logoUrl } = props
    const { user } = useSelector((state: RootState) => {
        return { user: state.user }
    })
    const { display: showLoginModal } = useLoginModal()
    const dispatch = useDispatch()
    const [wallet, setWallet] = useState(null)
    const { chainId, setChainId } = useChainId()

    useEffect(() => {
        getAddress(true).then(w => w?.length && setWallet(w))
    }, [])

    return <div className="menu-bar">
        <LogoIcon src={logoUrl} />
        <div className="menu-item-container">
            {
                menuItems && menuItems.map(i => {
                    if (i.id === 'user') {
                        if (user.account) {
                            if (user.account.avatar) {
                                i.icon = getNFTReadableSrc(user.account.avatar)
                            } else {
                                i.icon = "/imgs/face.svg"
                                i.icon = cdnPrefix + "profile.svg"
                            }
                        } else {
                            i.icon = cdnPrefix + "profile.svg"
                        }
                    }
                    return <MenuItem {...i} key={'menuitem' + i.name} fill={i.id === 'user' && user.account != null && false} onClick={() => {
                        if (i.loginRequired && !user.account) {
                            // showLoginModal(2)
                            // showLoginModal(1)
                            if (wallet)
                                window.location.href = localRouter("profile")
                            else
                                showLoginModal(1)
                        } else {
                            if (i.name === 'Profile') {
                                window.location.href = i.link
                            } else
                                window.location.href = i.link
                        }
                    }} />
                })
            }
        </div>
        <button className="switch-net-button" onClick={async () => {
            await switchChain(chainId === '0x1' ? '0x4' : '0x1')
            setChainId(chainId === '0x1' ? '0x4' : '0x1')
        }}>{chainId === '0x1' ? "Switch to Rinkeby" : "Switch to Mainnet"}</button>
        <div className="logout-button-wrapper">
            <img src={cdnPrefix + "logout.svg"} onClick={() => dispatch(logout())} alt="Logout" className="button" />
        </div>
    </div>
}

export { Menu, MenuItem, LogoIcon }

