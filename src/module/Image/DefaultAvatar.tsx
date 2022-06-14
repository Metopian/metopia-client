import React from "react"
import { fillZero } from "../../utils/stringUtils"
import './DefaultAvatar.css'

const getRandomColor = wallet => {
    let rhex = wallet.substring(2, 6)
    let ghex = wallet.substring(12, 6)
    let bhex = wallet.substring(22, 6)
    let r = parseInt(`0x${rhex}`) % 256
    let g = parseInt(`0x${ghex}`) % 256
    let b = parseInt(`0x${bhex}`) % 256

    return `#${fillZero(r.toString(16))}${fillZero(g.toString(16))}${fillZero(b.toString(16))}`
}

export const DefaultAvatar = (props: { wallet, className?}) => {
    const { wallet, className } = props
    if (!wallet || wallet.length < 40)
        return null
    let color = getRandomColor(wallet)
    return <svg width="23" height="30" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || ''}>
        <mask id="mask0_789_4520" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="23" height="30">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.29828 6.96138C8.65995 6.64134 9.03723 6.3213 9.43273 6.00646C14.9879 1.58052 20.9074 0.339388 21.1572 0.287348C21.4252 0.232707 21.7036 0.300358 21.9143 0.47469C22.1251 0.64642 22.25 0.906614 22.25 1.17982V28.8205C22.25 29.3227 21.8415 29.7312 21.3393 29.7312H4.99182C4.57761 29.7312 4.24182 29.3954 4.24182 28.9812V27.9098L4.24182 20.7206C3.8229 20.6503 3.31031 20.5124 2.78472 20.2496C1.60082 19.6564 0.843657 18.7249 0.812434 18.6858C0.596471 18.4152 0.549632 18.0457 0.695342 17.7309L0.867072 17.3562L0.87082 17.348C1.67895 15.5779 3.38092 11.8501 6.97128 8.21553C10.5672 4.57539 7.9366 7.28143 8.29828 6.96138Z" fill={color} />
        </mask>
        <g mask="url(#mask0_789_4520)">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.29828 6.96138C8.65995 6.64134 9.03723 6.3213 9.43273 6.00646C14.9879 1.58052 20.9074 0.339388 21.1572 0.287348C21.4252 0.232707 21.7036 0.300358 21.9143 0.47469C22.1251 0.64642 22.25 0.906614 22.25 1.17982V28.8205C22.25 29.3227 21.8415 29.7312 21.3393 29.7312H4.99182C4.57761 29.7312 4.24182 29.3954 4.24182 28.9812V27.9098L4.24182 20.7206C3.8229 20.6503 3.31031 20.5124 2.78472 20.2496C1.60082 19.6564 0.843657 18.7249 0.812434 18.6858C0.596471 18.4152 0.549632 18.0457 0.695342 17.7309L0.867072 17.3562L0.87082 17.348C1.67895 15.5779 3.38092 11.8501 6.97128 8.21553C10.5672 4.57539 7.9366 7.28143 8.29828 6.96138Z" fill={color} />
            <path fillRule="evenodd" clipRule="evenodd" d="M13.6064 14.826C15.0458 15.1647 16.4873 14.2723 16.826 12.8329C17.1647 11.3935 16.2723 9.952 14.8329 9.61331C13.3935 9.27462 11.952 10.167 11.6133 11.6064C11.2746 13.0458 12.167 14.4873 13.6064 14.826ZM13.3201 12.9249C13.7999 13.0378 14.2804 12.7403 14.3933 12.2605C14.5062 11.7807 14.2087 11.3002 13.7289 11.1873C13.2491 11.0744 12.7686 11.3719 12.6557 11.8517C12.5428 12.3315 12.8403 12.812 13.3201 12.9249Z" fill="white" />
            <path d="M4.26831 26.8613C3.77393 26.8613 3.36803 26.4632 3.35762 25.9662C3.34721 25.464 3.74791 25.0477 4.25009 25.0399C4.30473 25.0399 6.93271 24.967 9.89895 23.8716C10.3699 23.6973 10.8955 23.9393 11.0698 24.4102C11.2442 24.8812 11.0022 25.4068 10.5312 25.5811C7.24756 26.7936 4.40621 26.8587 4.28652 26.8613C4.27872 26.8613 4.27351 26.8613 4.26831 26.8613Z" fill="white" />
        </g>
    </svg >
}

export const DefaultAvatarWithRoundBackground = (props: { wallet, width?, height?, className?}) => {
    const { wallet, width, height, className } = props
    if (!wallet || wallet.length < 40)
        return null
    let color = getRandomColor(wallet)
    return <div style={{
        display: 'inline-block', justifyContent: 'center', alignItems: 'center',
        backgroundColor: color + '44', height: '40px', width: '40px', borderRadius: '20px',
        transform: height ? `scale(${height / 40})` : 'unset'
    }} className={'DefaultAvatarWithRoundBackground ' + (className || '')}>
        <div className="DefaultAvatarWrapper">
            <DefaultAvatar wallet={wallet} />
        </div>
    </div>
}