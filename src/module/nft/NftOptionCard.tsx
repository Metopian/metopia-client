import React from 'react';
import { useChainId } from '../../config/store';
import { OnClickFuncType } from '../../config/type/docTypes';
import { NftImage } from '../image';
import './NftOptionCard.scss';

declare interface ParamType {
    noLazy?: boolean;
    noTick?: boolean;
    src: string;
    selected: boolean;
    size?: number[];
    tokenAddress?: string;
    tokenId?: number;
    onClick: OnClickFuncType;
}

const NftOptionCard = (props: ParamType) => {
    const { size } = props
    const { chainId } = useChainId()
    if (!props.src || props.src.length === 0)
        return

    return (
        <div className={"nft-option-card" + (props.selected ? ' selected' : '')} onClick={props.onClick} style={size ? {
            minWidth: size[0] + 'px',
            maxWidth: size[1] + 'px',
            width: size[1] + 'px'
        } : {}}>
            <div className="text">
                {/* Details */}
            </div>
            <div className="content">
                <NftImage defaultSrc={props.src} chainId={chainId} tokenId={props.tokenId} contract={props.tokenAddress} width={size[1]}
                    className="image" />
                {props.noTick ? null : <img src="https://oss.metopia.xyz/check_box_off.svg" className="unchecked-icon" alt="" />}
                {props.noTick ? null : <img src="https://oss.metopia.xyz/check_box_on.svg" className="checked-icon" alt="" />}
            </div>
        </div>
    )
}

export default NftOptionCard