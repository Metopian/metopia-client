import React, { useEffect, useState } from 'react'
import { serialize } from "../../utils/serializeUtil"
import RichTextBySlate from './RichTextCore'
import './RichTextEditor.css'
const emoji = RichTextBySlate.Emoji
let SimpleTextEditor = (props) => {
    const { html, editorHeight, initialValue, onChange } = props
    const [rawValue, setRawValue] = useState([])

    useEffect(() => {
        onChange && onChange(html ? serialize({ children: rawValue }) : rawValue)
    }, [rawValue, onChange, html])

    return (
        <div className={"SimpleTextEditor " + props.className} style={props.style}>
            <RichTextBySlate editorStyle={{ height: editorHeight }} preventPopup disableLineBreak plain
                setRawValue={setRawValue} initialValue={initialValue}
                toolbar={[[emoji]]} {...props} />
        </div>
    )
}

function RichTextEditor(props) {
    const { html, editorHeight, initialValue, disabled, selectimage, onChange } = props
    const [rawValue, setRawValue] = useState([])
    useEffect(() => {
        onChange && onChange(html ? serialize({ children: rawValue }) : rawValue)
    }, [rawValue, html, onChange])

    return (
        <div className={"DefaultRichTextEditorWrapper " + props.className + (disabled ? " disabled " : '')}>
            <RichTextBySlate editorStyle={{ height: editorHeight }}
                setRawValue={setRawValue} initialValue={initialValue}
                {...props} >{props.children}</RichTextBySlate>
        </div>
    )
}

export { SimpleTextEditor, RichTextEditor as DefaultTextEditor }

