import React, { ReactElement } from 'react'
import { useElementSize } from 'usehooks-ts'
import './index.css'

const FlexibleOrderedContainer = (props: { elementMinWidth: number, elementMaxWidth: number, gap: number, children, style?}) => {
    const [squareRef, { width }] = useElementSize()
    let maxNum = Math.floor((width + props.gap) / (props.elementMinWidth + props.gap))
    let minNum = Math.floor((width + props.gap) / (props.elementMaxWidth + props.gap))

    let maxRowsNum = Math.ceil((props.children as Array<ReactElement>).length / minNum)
    let lastRowNum = (props.children as Array<ReactElement>).length % (maxRowsNum > 1 ? maxNum : minNum)
    let placeHolders: JSX.Element[] = []

    while (placeHolders.length < ((maxRowsNum > 1 ? maxNum : minNum) - lastRowNum)) {
        placeHolders.push(<div className="FlexibleOrderedContainerPlaceHolder" key={placeHolders.length} style={{
            minWidth: props.elementMinWidth + 'px',
            maxWidth: props.elementMaxWidth + 'px'
        }} ><div style={{ width: props.elementMaxWidth + 'px', height: '1px' }}></div></div>)
    }
    return <div className="FlexibleOrderedContainer" ref={squareRef} style={Object.assign({}, { gap: props.gap || 0 }, props.style || {})}>
        {props.children}
        {placeHolders}
    </div>

}

export default FlexibleOrderedContainer