import data from '@emoji-mart/data'
import { css, cx } from '@emotion/css'
// import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import imageExtensions from 'image-extensions'
import isHotkey from 'is-hotkey'
import isUrl from 'is-url'
import $ from 'jquery'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import {
    createEditor, Editor, Element as SlateElement, Node, Range, Text,
    Transforms
} from 'slate'
import { withHistory } from 'slate-history'
import { jsx } from 'slate-hyperscript'
import { Editable, ReactEditor, Slate, useFocused, useSelected, useSlate, useSlateStatic, withReact } from 'slate-react'
import { extractContent } from '../../utils/DomUtil'
import { deserialize } from '../../utils/serializeUtil'
import './RichTextCore.css'

function EmojiPicker(props) {
    const ref = useRef()

    useEffect(() => {
        new Picker({ ...props, data, ref })
    }, [props])

    return <div ref={ref} />
}

const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline'
}

const defaultInit = [
    {
        type: 'paragraph',
        children: [
            { text: '' },
        ],
    }
]

const LIST_TYPES = ['numbered-list', 'bulleted-list']

// export default function RichTextEditor(props){
//     defalutHeight="300px"

//     return(
//         <div style={{ padding: "20px" ,backgroundColor:"#fff"}}>
//             <RichTextBySlate height={defalutHeight || props.height} />
//         </div>
//     )
// }



const withLinks = editor => {
    const { insertData, insertText, isInline } = editor
    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.insertText = text => {
        if (text && isUrl(text)) {
            wrapLink(editor, text)
        } else {
            insertText(text)
        }
    }

    editor.insertData = data => {
        const text = data.getData('text/plain')

        if (text && isUrl(text)) {
            wrapLink(editor, text)
        } else {
            insertData(data)
        }
    }

    return editor
}

const withImageNormalize = editor => {
    const { normalizeNode } = editor
    editor.normalizeNode = entry => {
        const [node, path] = entry
        // if (SlateElement.isElement(node) && node.type === "image") {Transforms.insertNodes(editor,[{type:'paragraph',children:[{text:""}]}])}
        if (SlateElement.isElement(node) && node.type === 'paragraph') {
            for (const [child, childPath] of Node.children(editor, path)) {
                if (SlateElement.isElement(child) && child.type === 'image') {
                    Transforms.removeNodes(editor, { at: childPath })
                    Transforms.insertNodes(editor, child, { at: path })
                    return
                }
            }
        }
        return normalizeNode(entry)
    }
    return editor
}

const withImage = editor => {
    const { insertData, isVoid } = editor
    editor.isVoid = element => {
        return element.type === 'image' ? true : isVoid(element)
    }
    editor.insertData = data => {
        const text = data.getData('text/plain')
        const { files } = data

        if (files && files.length > 0) {
            for (const file of files) {
                const reader = new FileReader()
                const [mime] = file.type.split('/')

                if (mime === 'image') {
                    reader.addEventListener('load', () => {
                        const url = reader.result
                        insertImage(editor, url)
                    })

                    reader.readAsDataURL(file)
                }
            }
        } else if (isImageUrl(text)) {
            insertImage(editor, text)
        } else {
            insertData(data)
        }
    }
    return editor
}
const insertImage = (editor, url) => {
    const image = { type: 'image', url, children: [{ text: '' }] }
    Transforms.insertNodes(editor, image)
    Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] })
}
const isImageUrl = url => {
    if (!url) return false
    if (!isUrl(url)) return false
    const ext = new URL(url).pathname.split('.').pop()
    return imageExtensions.includes(ext)
}


const withHtml = (editor, plain) => {
    const { insertData, isInline, isVoid } = editor
    editor.isInline = element => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.isVoid = element => {
        return element.type === 'image' ? true : isVoid(element)
    }

    editor.insertData = data => {

        const html = data.getData('text/html')

        if (html) {
            if (!plain) {
                let fragment = deserialize(html)
                if (Array.isArray(fragment)) {
                    fragment = wrapTopLevelInlineNodesInParagraphs(
                        editor,
                        fragment
                    )
                }
                Transforms.insertFragment(editor, fragment)
                return
            } else {
                let text = extractContent(html)
                editor.insertText(text)
                return
            }
        }

        insertData(data)
    }

    return editor
}

const wrapTopLevelInlineNodesInParagraphs = (editor, fragment) => {
    let inlineNodes = []
    const newFragments = []

    const maybePushInlineNodeParagraph = () => {
        if (inlineNodes.length > 0) {
            newFragments.push(jsx("element", { type: "paragraph" }, inlineNodes))
            inlineNodes = []
        }
    }

    fragment.forEach(node => {
        if (Text.isText(node) || Editor.isInline(editor, node)) {
            inlineNodes.push(node)
        } else {
            maybePushInlineNodeParagraph()
            newFragments.push(node)
        }
    })
    maybePushInlineNodeParagraph()

    return newFragments
}

const toggleAlign = (editor, format) => {
    const isActive = isAlignActive(editor, format)
    const newProperties = {
        align: isActive ? null : format
    }
    Transforms.setNodes(editor, newProperties)
}

const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format)
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
        match: n =>
            LIST_TYPES.includes(
                !Editor.isEditor(n) && SlateElement.isElement(n) && n.type
            ),
        split: true,
    })
    const newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
    Transforms.setNodes(editor, newProperties)

    if (!isActive && isList) {
        const block = { type: format, children: [] }
        Transforms.wrapNodes(editor, block)
    }
}

const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format)

    if (isActive) {
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })

    return !!match
}

const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

const isAlignActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === format,
    })

    return !!match
}



const Element = props => {
    const { attributes, children, element } = props
    switch (element.type) {
        case 'block-quote':
            return <blockquote style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</blockquote>
        case 'bulleted-list':
            return <ul style={{ paddingLeft: "20px", textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</ul>
        case 'heading-one':
            return <h1 style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</h1>
        case 'heading-two':
            return <h2 style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</h2>
        case 'heading-three':
            return <h3 style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</h3>
        case 'heading-four':
            return <h4 style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</h4>
        case 'heading-five':
            return <h5 style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</h5>
        case 'heading-six':
            return <h6 style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</h6>
        case 'list-item':
            return <li style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</li>
        case 'numbered-list':
            return <ol style={{ paddingLeft: "20px", textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</ol>
        case 'link':
            return <a style={{ textAlign: element.align, fontSize: element.fontSize }} href={element.url} {...attributes}>{children}</a>
        case 'image':
            return <ImageElement {...props} />
        default:
            return <p style={{ textAlign: element.align, fontSize: element.fontSize }}{...attributes}>{children}</p>
    }
}

const ImageElement = ({ attributes, children, element }) => {
    const selected = useSelected()
    const focused = useFocused()
    return (
        <div style={{ textAlign: element.align }}{...attributes}>
            <img
                src={element.url}
                className={css`
                display: inline-block;
                max-width: 100%;
                max-height: 20em;
                box-shadow: ${selected && focused ? '0 0 0 2px #03b2cb;' : 'none'};
                `}
                alt=""
            />
            {children}
        </div>
    )
}

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    if (leaf.code) {
        children = <code>{children}</code>
    }

    if (leaf.italic) {
        children = <em>{children}</em>
    }

    if (leaf.underline) {
        children = <u>{children}</u>
    }
    if (leaf.strikethrough) {
        children = <del>{children}</del>
    }

    return <span {...attributes}>{children}</span>
}

const EmotionButton = () => {

}

const AlignButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <Button
            active={isAlignActive(editor, format)}
            onMouseDown={event => {
                event.preventDefault()
                toggleAlign(editor, format)
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}

const ImageButton = ({ imageModal, disabled, format, icon }) => {
    return (
        <Button
            className={"ImgButton" + (disabled ? ' disabled' : '')}
            // active={modalActive}
            onMouseDown={event => {
                if (disabled)
                    return
                event.preventDefault()
                let el = imageModal.current
                if (el) {
                    el.value = null
                    el.click();
                }
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}

const ImageSelectModal = forwardRef((props, ref) => {
    const editor = useSlateStatic()

    return (
        // <div>
        <SlatePortal>
            <input className="ImgSelect" ref={ref} onChange={(e) => {
                console.log(ref.current, props.debug)
                if (props.selectimage) {
                    props.selectimage(ref.current.files[0])
                } else {
                    let reader = new FileReader();
                    reader.onload = (data) => {
                        insertImage(editor, reader.result)
                    }
                    reader.readAsDataURL(ref.current.files[0])
                }
            }
            } type="file" accept="image/*" style={{ display: "none", opacity: "0" }} />
        </SlatePortal>
        // </div>
    )
})

const EmojiButton = ({ showEmojiModal, format, icon, disabled }) => {
    const editor = useSlateStatic();

    return (
        <Button
            onMouseDown={e => e.preventDefault()}
            onClick={event => {
                if (disabled)
                    return
                event.preventDefault()
                ReactEditor.focus(editor)
                showEmojiModal()
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}

const EmojiModal = forwardRef((props, ref) => {

    const { style } = props
    const editor = useSlateStatic();
    const emojiWrapper = useRef(null)
    useImperativeHandle(
        ref,
        () => ({
            show() {
                emojiWrapper.current.style.display = 'block'
            }
        }),
    )

    // const show = () => {
    //     emojiWrapper.current.style.display = 'block'
    // }
    // EmojiModal.show = show

    const hide = () => {
        emojiWrapper.current.style.display = 'none'
    }
    let defaultStyle = { display: 'none' }
    if (style) {
        Object.assign(defaultStyle, style)
    }

    return <div className="EmojiWrapper" ref={emojiWrapper} style={defaultStyle}>
        <EmojiPicker onEmojiSelect={(e) => {
            editor.insertText(e.native)
            hide()
        }} />
        {/* <Picker
            showPreview={false}
            onSelect={(e) => {
                editor.insertText(e.native)
                hide()
            }}
        /> */}
        <div className="EmojiWrapperMask" onClick={hide}></div></div>
})



const BlockButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <Button
            active={isBlockActive(editor, format)}
            onMouseDown={event => {
                event.preventDefault()
                toggleBlock(editor, format)
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}

const MarkButton = ({ format, icon, reversed }) => {
    const editor = useSlate()
    return (
        <Button
            active={isMarkActive(editor, format)}
            onMouseDown={event => {
                event.preventDefault()
                toggleMark(editor, format)
            }}
            reversed={reversed}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}

const LinkButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <Button
            active={isLinkActive(editor)}
            onMouseDown={event => {
                event.preventDefault()
                const url = window.prompt('Enter the URL of the link:')
                if (!url) return
                insertLink(editor, url)
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}
const RemoveLinkButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <Button
            active={isLinkActive(editor)}
            onMouseDown={event => {
                if (isLinkActive(editor)) {
                    unwrapLink(editor)
                }
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}
const isLinkActive = editor => {
    const [link] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    })
    return !!link
}

const insertLink = (editor, url) => {
    if (editor.selection) {
        wrapLink(editor, url)
    }
}

const unwrapLink = editor => {
    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    })
}

const wrapLink = (editor, url) => {
    if (isLinkActive(editor)) {
        unwrapLink(editor)
    }

    const { selection } = editor
    const isCollapsed = selection && Range.isCollapsed(selection)
    // if (url.statwith('http'))
    const link = {
        type: 'link',
        url,
        children: isCollapsed ? [{ text: url }] : [],
    }

    if (isCollapsed) {
        Transforms.insertNodes(editor, link)
    } else {
        Transforms.wrapNodes(editor, link, { split: true })
        Transforms.collapse(editor, { edge: 'end' })
    }
}

const Button = React.forwardRef(
    (
        {
            className,
            active,
            reversed,
            ...props
        },
        ref
    ) => (
        <span
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
            :hover{color:#06c}
            cursor: pointer;
            color: ${reversed
                        ? active
                            ? 'white'
                            : '#aaa'
                        : active
                            ? 'black'
                            : '#ccc'};
          `
            )}
        />
    )
)

const EditorValue = React.forwardRef(
    (
        {
            className,
            value,
            ...props
        },
        ref
    ) => {
        const textLines = value.document.nodes
            .map(node => node.text)
            .toArray()
            .join('\n')
        return (
            <div
                ref={ref}
                {...props}
                className={cx(
                    className,
                    css`
              margin: 30px -20px 0;
            `
                )}
            >
                <div
                    className={css`
              font-size: 14px;
              padding: 5px 20px;
              color: #404040;
              border-top: 2px solid #eeeeee;
              background: #f8f8f8;
            `}
                >
                </div>
                <div
                    className={css`
              color: #404040;
              font: 12px monospace;
              white-space: pre-wrap;
              padding: 10px 20px;
              div {
                margin: 0 0 0.5em;
              }
            `}
                >
                    {textLines}
                </div>
            </div>
        )
    }
)

const Icon = React.forwardRef(
    (
        { className, ...props },
        ref
    ) => (
        <span
            {...props}
            ref={ref}
            className={cx(
                'material-icons',
                className,
                css`
            vertical-align: text-bottom;
          `
            )}
        />
    )
)


const Instruction = React.forwardRef(
    (
        { className, ...props },
        ref
    ) => (
        <div
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
            white-space: pre-wrap;
            margin: 0 -20px 10px;
            padding: 10px 20px;
            font-size: 14px;
            background: #f8f8e8;
          `
            )}
        />
    )
)

const Menu = React.forwardRef(
    (
        { className, ...props },
        ref
    ) => (
        <div
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
            & > * {
              display: inline-block;
              margin-right: 12px;
            }
            & > * + * {
            }
          `
            )}
        />
    )
)

const SlatePortal = ({ children }) => {
    return typeof document === 'object'
        ? ReactDOM.createPortal(children, document.body)
        : null
}

const Toolbar = React.forwardRef(
    (
        { className, ...props },
        ref
    ) => (
        <Menu
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
            position: relative;
            padding: 1px 18px 17px;
            margin: 0 -20px;
            border-bottom: 2px solid #eee;
            margin-bottom: 12px;
          `
            )}
        />
    )
)
const HoveringToolbar = (props) => {
    const ref = useRef()
    const editor = useSlate()

    const { disabled } = props
    useEffect(() => {
        if (disabled)
            return
        const el = ref.current
        const { selection } = editor

        if (!el) {
            return
        }

        if (
            !selection ||
            !ReactEditor.isFocused(editor) ||
            Range.isCollapsed(selection) ||
            Editor.string(editor, selection) === ''
        ) {
            el.removeAttribute('style')
            return
        }

        const domSelection = window.getSelection()
        const domRange = domSelection.getRangeAt(0)
        const rect = domRange.getBoundingClientRect()
        el.style.opacity = '1'
        el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
        el.style.left = `${rect.left +
            window.pageXOffset -
            el.offsetWidth / 2 +
            rect.width / 2}px`
    })

    return (
        <SlatePortal>
            <Menu
                ref={ref}
                className={
                    css`
                        padding: 8px 7px 6px;
                        position: absolute;
                        z-index: 1;
                        top: -10000px;
                        left: -10000px;
                        margin-top: -6px;
                        opacity: 0;
                        background-color: #222;
                        border-radius: 4px;
                        transition: opacity 0.75s;
                    `
                }
            >
                <MarkButton format="bold" icon="format_bold" reversed={true} />
                <MarkButton format="italic" icon="format_italic" reversed={true} />
                <MarkButton format="underline" icon="format_underlined" reversed={true} />
                <MarkButton format="strikethrough" icon="format_strikethrough" reversed={true} />
                <MarkButton format="code" icon="code" />
            </Menu>
        </SlatePortal>
    )
}



const FontSizeEditor = (props) => {
    const editor = useSlate()
    const [enabled, setEnabled] = useState(false)
    const [lastSelectedFontSize, setLastSelectedFontSize] = useState()
    const { defaultfontsize } = props
    const [value, setValue] = useState(defaultfontsize || '18')

    useEffect(() => {
        // const el = ref.current
        const { selection } = editor
        if (selection !== null && selection.anchor !== null) {
            let selected = editor.children[selection.anchor.path[0]];
            // let fontSize = '18'
            let fontSize = defaultfontsize || 18
            if (selected && selected.fontSize && selected.fontSize.length > 0) {
                fontSize = selected.fontSize.substring(0, selected.fontSize.length - 2)
            }

            if (fontSize != value && !enabled) {
                setValue(fontSize)
            }
        }
    }, [editor, defaultfontsize, value, enabled])

    const fakeKeydown = (e) => {
        let tmp = document.getElementById('FontSizeEditor').innerText
        if (e.keyCode >= 48 && e.keyCode <= 57) {
            tmp = tmp + e.key
            if (parseInt(tmp) > 60) {
                tmp = '60'
                setValue(60)
            }
            setValue(tmp)
        } if (e.keyCode == 8) {
            if (tmp.length > 0)
                setValue(tmp.substring(0, tmp.length - 1))
        }
        if (e.keyCode == 13) {
            fakeLoseFocus()
        }
        e.preventDefault()
    }

    const fakeLoseFocus = (e) => {
        if (e && e.target && (e.target.id == 'FontSizeEditor' || e.target.id == 'FontSizeEditorValue'))
            return
        setEnabled(false)
        window.removeEventListener("click", fakeLoseFocus)
        window.removeEventListener("keydown", fakeKeydown)
        e && e.preventDefault()
        let tmp = document.getElementById('FontSizeEditor').innerText
        if (tmp.length == 0 || parseInt(tmp) < 13) {
            tmp = '13'
            setValue(13)
        }
        if (parseInt(tmp) > 60) {
            tmp = '60'
            setValue(60)
        }
        const newProperties = {
            fontSize: tmp + 'px'
        }
        Transforms.setNodes(editor, newProperties)
    }

    const startFakeFocus = (e) => {
        if (!enabled) {
            setEnabled(true)
            window.addEventListener("click", fakeLoseFocus)
            window.addEventListener("keydown", fakeKeydown)
        }
        e.preventDefault()
    }

    return (
        <div className={"FontSizeEditorWrapper"}>
            <img src="https://oss.happyblocklabs.com/platform/web/imgs/fontsize.svg" title={'Font Size(pt)'} alt="" />
            <div id="FontSizeEditor" className={"FontSizeEditor" + (enabled ? ' enabled' : '')} title={'Font Size(pt)'}
                onClick={e => e.preventDefault()}
                onMouseDown={e => {
                    e.preventDefault()
                    startFakeFocus(e)
                }}
            ><div className="FontSizeEditorValue" id="FontSizeEditorValue" >{value}</div></div>
        </div>
    )
}

const Bold = (props) => <MarkButton format="bold" icon="format_bold" {...props} />
const Italic = (props) => <MarkButton format="italic" icon="format_italic"  {...props} />
const Underline = (props) => <MarkButton format="underline" icon="format_underlined"  {...props} />
const StrikeThrough = (props) => <MarkButton format="strikethrough" icon="format_strikethrough"  {...props} />
const Code = (props) => <MarkButton format="code" icon="code"  {...props} />
const Link = (props) => <LinkButton format="link" icon="link"  {...props} />
const RemoveLink = (props) => <RemoveLinkButton format="link_off" icon="link_off"  {...props} />
const Image = ({ selectimage, debug, disabled, ...otherProps }) => {
    const imageModal = useRef(null)
    return <div {...otherProps} >
        <ImageButton format="image" icon="image" disabled={disabled} imageModal={imageModal} />
        <ImageSelectModal selectimage={selectimage} debug={debug} ref={imageModal} />
    </div>
}
const Left = (props) => <AlignButton format="left" icon="format_align_left"  {...props} />
const Center = (props) => <AlignButton format="center" icon="format_align_center"  {...props} />
const Right = (props) => <AlignButton format="right" icon="format_align_right" {...props} />
const H1 = (props) => <BlockButton format="heading-one" icon="looks_one" {...props} />
const H2 = (props) => <BlockButton format="heading-two" icon="looks_two"  {...props} />
const H3 = (props) => <BlockButton format="heading-three" icon="looks_3" {...props} />
const H4 = (props) => <BlockButton format="heading-four" icon="looks_4" {...props} />
const H5 = (props) => <BlockButton format="heading-five" icon="looks_5" {...props} />
const Quote = (props) => <BlockButton format="block-quote" icon="format_quote"  {...props} />
const List = (props) => <BlockButton format="numbered-list" icon="format_list_numbered"  {...props} />
const UList = (props) => <BlockButton format="bulleted-list" icon="format_list_bulleted"  {...props} />

const Emoji = (props) => {
    const emojiModal = useRef(null)
    const { disabled } = props
    const showEmojiModal = () => {
        emojiModal.current.show()
    }
    return (
        <div {...props} className="EmojiButton" >
            <EmojiButton disabled={disabled} showEmojiModal={showEmojiModal} format="emoji_emotions" icon="emoji_emotions" />
            <EmojiModal style={props.emojimodalstyle} ref={emojiModal} />
        </div >
    )
}
const FontSize = (props) => <FontSizeEditor  {...props} />
FontSize.desc = 'fontsize'
Emoji.desc = 'emoji'
Image.desc = "image"

const defaultToolbar = [
    [H1, H2, H3, H4, H5],
    [Bold, Italic, Underline, StrikeThrough, Code],
    [Link, RemoveLink, Image],
    [Left, Center, Right],
    // [FontSize],
    [Quote, List, UList],
    [Emoji]
]

const RichTextBySlate = (props) => {
    const { setRawValue, initialValue, toolbar, defaultfontsize, emojimodalstyle, clearButtonId,
        preventPopup, disableLineBreak, plain, selectimage, disabled, debug } = props
    const [value, setValue] = useState(initialValue || defaultInit)
    const [clearTriggerFlag, setClearTriggerFlag] = useState(false)
    // const [clearTrigger, setClearTrigger] = useState(false)
    useEffect(() => { setRawValue(value) }, [value, setRawValue])
    const renderElement = useCallback(props => <Element {...props} />, [])
    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    const editor = useMemo(() => withHtml(withImage(withLinks(withHistory(withImageNormalize(withReact(createEditor()))))), plain), [plain])
    // useEffect(()=>{setValue(initialValue)},[initialValue])

    useEffect(() => {
        if (clearButtonId && !clearTriggerFlag) {
            $(window.document.getElementById(clearButtonId)).click(e => {
                setValue(initialValue || defaultInit)
            })
            setClearTriggerFlag(true)
        }
    }, [clearButtonId, clearTriggerFlag, initialValue])

    return (
        <Slate editor={editor} value={value} onChange={value => {
            setValue(value)
            setRawValue(value)
        }}
        >
            {/* <HoveringToolbar disabled={preventPopup} /> */}
            <Toolbar>
                {
                    (toolbar || defaultToolbar).map((group, i) => {
                        let tmp = group.map((item, j) => {
                            if (item.desc == 'fontsize') {
                                return item({ key: 'toolbaritem' + i + "-" + j, disabled: disabled, defaultfontsize: defaultfontsize })
                            } else if (item.desc == 'image') {
                                return item({ key: 'toolbaritem' + i + "-" + j, disabled: disabled, selectimage: selectimage, debug: debug })
                            } else if (item.desc == 'emoji') {
                                return item({ key: 'toolbaritem' + i + "-" + j, disabled: disabled, emojimodalstyle: emojimodalstyle })
                            } else {
                                return item({ key: 'toolbaritem' + i + "-" + j, disabled: disabled })
                            }
                        })
                        i > 0 && i < (toolbar || defaultToolbar).length - 1 &&
                            tmp.push(<span style={{ width: "2px", height: "1rem", backgroundColor: "#ccc" }} key={"split" + i} />)
                        return tmp
                    })
                }
            </Toolbar>
            {props.children}
            <Editable
                placeholder={props.placeholder}
                readOnly={disabled}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                spellCheck
                // autoFocus
                style={Object.assign({ ...props.editorStyle, overflowY: "auto", }, (defaultfontsize ? { fontSize: defaultfontsize + 'px', lineHeight: defaultfontsize * 2 + "px" } : { minHeight: '320px' }))}
                className={'editorarea'}
                onDrop={event => { }}
                onKeyDown={event => {
                    for (const hotkey in HOTKEYS) {
                        if (isHotkey(hotkey, event)) {
                            event.preventDefault()
                            const mark = HOTKEYS[hotkey]
                            toggleMark(editor, mark)
                        }

                    }
                    if (isHotkey('mod+enter', event) || isHotkey('shift+enter', event) || isHotkey('alt+enter', event)) {
                        event.preventDefault()
                        if (!disableLineBreak)
                            Editor.insertBreak(editor)
                    }
                    if (isHotkey('enter', event)) {
                        if (props.submit) {
                            event.preventDefault()
                            props.submit()
                            Transforms.select(editor, Editor.start(editor, []))
                            setValue(initialValue || defaultInit)
                            // Transforms.delete(editor, {
                            //     at: {
                            //         anchor: { path: [0, 0], offset: 0 },
                            //         focus: { path: [editor.children.length - 1, 0], offset: 2 },
                            //     },
                            // })
                        }
                        if (disableLineBreak) {
                            event.preventDefault()
                        }
                    }
                    if (plain) {
                        let p = event.target.getElementsByTagName('p')[0]
                        let element = event.target.getElementsByTagName('span')[0]
                        let unit = event.target.offsetWidth / 2
                        if (element.offsetWidth > unit) {
                            let fold = Math.ceil(element.offsetWidth / unit) + 1
                            p.style.width = unit * fold + 'px'
                        } else {
                            p.style.width = event.target.offsetWidth + 'px'
                        }
                    }
                }}
            />
        </Slate>
    )
}

RichTextBySlate.Bold = Bold
RichTextBySlate.Italic = Italic
RichTextBySlate.Underline = Underline
RichTextBySlate.StrikeThrough = StrikeThrough
RichTextBySlate.Code = Code
RichTextBySlate.Link = Link
RichTextBySlate.RemoveLink = RemoveLink
RichTextBySlate.Image = Image
RichTextBySlate.Left = Left
RichTextBySlate.Center = Center
RichTextBySlate.Right = Right
RichTextBySlate.H1 = H1
RichTextBySlate.H2 = H2
RichTextBySlate.H3 = H3
RichTextBySlate.H4 = H4
RichTextBySlate.H5 = H5
RichTextBySlate.Quote = Quote
RichTextBySlate.List = List
RichTextBySlate.UList = UList
RichTextBySlate.Emoji = Emoji
RichTextBySlate.FontSize = FontSize

export default RichTextBySlate