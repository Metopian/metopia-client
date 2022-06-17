import React from 'react';
import { useChainId } from '../../config/store';
import { OnClickFuncType } from '../../config/type/docTypes';
import { NftImage } from '../image';
import './NftOptionCard.css';

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
    const {chainId} = useChainId()
    if (!props.src || props.src.length === 0)
        return

    return (
        <div className={"NftOptionCard" + (props.selected ? ' selected' : '')} onClick={props.onClick} style={size ? {
            minWidth: size[0] + 'px',
            maxWidth: size[1] + 'px',
            width: size[1] + 'px'
        } : {}}>
            <div className="text">
                {/* Details */}
            </div>
            <div className="NftOptionCardContent">
                <NftImage defaultSrc={props.src} chainId={chainId} tokenId={props.tokenId} contract={props.tokenAddress} width={size[1]} className="NftOptionCardImage" />
                {props.noTick ? null : <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/check_box_off.svg" className="NftCardUncheckedIcon" alt="" />}
                {props.noTick ? null : <img src="https://metopia.oss-cn-hongkong.aliyuncs.com/check_box_on.svg" className="NftCardCheckedIcon" alt="" />}
            </div>
        </div>
    )
}

export default NftOptionCard