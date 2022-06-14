import React, { useEffect, useState } from 'react'
import { serialize } from "../../utils/serializeUtil"
import RichTextBySlate from './RichTextCore'
import './RichTextEditor.css'
const emoji = RichTextBySlate.Emoji
let SimpleTextEditor = (props) => {
    const { html, editorHeight, initialValue } = props
    const [rawValue, setRawValue] = useState([])

    useEffect(() => {
        props.onChange && props.onChange(html ? serialize({ children: rawValue }) : rawValue)
    }, [rawValue])

    return (
        <div className={"SimpleTextEditor " + props.className} style={props.style}>
            <RichTextBySlate editorStyle={{ height: editorHeight }} preventPopup disableLineBreak plain
                setRawValue={setRawValue} initialValue={initialValue}
                toolbar={[[emoji]]} {...props} />
        </div>
    )
}

function RichTextEditor(props) {
    const { html, editorHeight, initialValue, disabled, selectimage } = props
    const [rawValue, setRawValue] = useState([])
    useEffect(() => {
        props.onChange && props.onChange(html ? serialize({ children: rawValue }) : rawValue)
    }, [rawValue])

    return (
        <div className={"DefaultRichTextEditorWrapper " + props.className + (disabled ? " disabled " : '')}>
            <RichTextBySlate editorStyle={{ height: editorHeight }}
                setRawValue={setRawValue} initialValue={initialValue}
                {...props} >{props.children}</RichTextBySlate>
        </div>
    )
}

export { SimpleTextEditor, RichTextEditor as DefaultTextEditor }

