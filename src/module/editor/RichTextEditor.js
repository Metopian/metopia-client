import React, { useEffect, useState } from 'react'
import { serialize } from "../../utils/serializeUtil"
import RichTextBySlate from './RichTextCore'
import './RichTextEditor.css'

export const { Emoji,
    Bold, Italic, Underline, StrikeThrough,
    Code,
    Link, RemoveLink, Image,
    Left, Center, Right,
    H1, H2, H3, H4, H5,
    Quote,
    List,
    UList,
    FontSize } = RichTextBySlate

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
                toolbar={[[Emoji]]} {...props} />
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

