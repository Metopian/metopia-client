import { Text } from "slate";
import { jsx } from "slate-hyperscript";
import escapeHtml from 'escape-html'

const ELEMENT_TAGS = {
    A: el => ({ type: 'link', url: el.getAttribute('href'), align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    BLOCKQUOTE: el => ({ type: 'block-quote', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    H1: el => ({ type: 'heading-one', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    H2: el => ({ type: 'heading-two', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    H3: el => ({ type: 'heading-three', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    H4: el => ({ type: 'heading-four', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    H5: el => ({ type: 'heading-five', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    H6: el => ({ type: 'heading-six', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    IMG: el => ({ type: 'image', url: el.getAttribute('src'), align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    LI: el => ({ type: 'list-item', align: `${getAttr(el, 'text-align')}` }),
    OL: el => ({ type: 'numbered-list', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    P: el => ({ type: 'paragraph', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    PRE: el => ({ type: 'code', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
    UL: el => ({ type: 'bulleted-list', align: `${getAttr(el, 'text-align')}`, fontSize: el.style.fontSize }),
}

const TEXT_TAGS = {
    CODE: () => ({ code: true }),
    DEL: () => ({ strikethrough: true }),
    EM: () => ({ italic: true }),
    I: () => ({ italic: true }),
    S: () => ({ strikethrough: true }),
    STRONG: () => ({ bold: true }),
    U: () => ({ underline: true }),
}
const getAttr = (el, type) => {
    let attr = el.getAttribute('style')
    let result
    let tmp
    let res = null
    if (attr) {
        tmp = attr.split(";")
        tmp.forEach(item => {
            result = item.split(':')
            if (result[0] == type) res = result[1]
        })
    }
    return res
}

export const serialize = (node, onClickImage?) => {
    if (Text.isText(node)) {
        let begin = ""
        let end = ""
        if ((node as any).code) { begin = begin + "<code>"; end = "</code>" + end; }
        if ((node as any).bold) { begin = begin + "<strong>"; end = "</strong>" + end; }
        if ((node as any).italic) { begin = begin + "<em>"; end = "</em>" + end; }
        if ((node as any).underline) { begin = begin + "<u>"; end = "</u>" + end; }
        if ((node as any).strikethrough) { begin = begin + "<del>"; end = "</del>" + end; }
        return `${begin}${escapeHtml(node.text)}${end}`
    }

    // let style = node.align ? ` style="text-align:${node.align}"` : ""
    let styleMap = { 'text-align': node.align, 'font-size': node.fontSize }
    let styleString = ""
    let styleFlag = false
    Object.values(styleMap).forEach(v => {
        if (v && v.length > 0 && v != 'null') {
            styleFlag = true
        }
    })
    if (styleFlag) {
        styleString += "style=\""
        Object.keys(styleMap).forEach(k => {
            if (styleMap[k] && styleMap[k].length > 0 && styleMap[k] != 'null')
                styleString += k + ":" + styleMap[k] + ";"
        })
        styleString = styleString.substring(0, styleString.length - 1)
        styleString += "\""
    }
    if (node.type == 'image') {
        // if (node.url.indexOf("oss.happyblocklabs.com") > -1) {
        //     return `<img src="${urls.ossThumbNail(escapeHtml(node.url))}" ${styleString}/>`
        // } else {
        return `<img src="${node.url}" ${styleString}/>`
        // }
    }
    const children = node.children.map(n => serialize(n)).join('')
    const spacedStyleString = styleString?.length ? ` ${styleString}` : ''
    switch (node.type) {
        case 'block-quote':
            return `<blockquote ${spacedStyleString}><p>${children}</p></blockquote>`
        case 'paragraph':
            return `<p${spacedStyleString}>${children}</p>`
        case 'link':
            return `<a href="${escapeHtml(node.url)}" >${children}</a>`
        case 'bulleted-list':
            return `<ul${spacedStyleString}>${children}</ul>`
        case 'heading-one':
            return `<h1${spacedStyleString}>${children}</h1>`
        case 'heading-two':
            return `<h2${spacedStyleString}>${children}</h2>`
        case 'heading-three':
            return `<h3${spacedStyleString}>${children}</h3>`
        case 'heading-four':
            return `<h4${spacedStyleString}>${children}</h4>`
        case 'heading-five':
            return `<h5${spacedStyleString}>${children}</h5>`
        case 'heading-six':
            return `<h6${spacedStyleString}>${children}</h6>`
        case 'list-item':
            return `<li${spacedStyleString}>${children}</li>`
        case 'numbered-list':
            return `<ol${spacedStyleString}>${children}</ol>`
        default:
            return children
    }
}

export const deserialize = data => {
    const parsed = new DOMParser().parseFromString(data, 'text/html')
    // console.log(parsed.body)
    let fragment = ds(parsed.body)
    fragment = dataClean(fragment)
    // console.log("fragment",fragment[fragment.length-1])    
    // if (fragment[fragment.length-1].type && fragment[fragment.length-1].type!='image')fragment.unshift({ type: "paragraph", children: [{ text: "" }] })
    if (fragment[fragment.length - 1].type && fragment[fragment.length - 1].type == 'image') fragment.push({ type: "paragraph", children: [{ text: "" }] })
    return fragment
}

export const innerText = (data) => {
    let result = ""
    data.forEach(d => {
        if (d.text) {
            result += d.text
        }
        if (d.children)
            result += innerText(d.children)
    })
    return result
}

export const containsImage = (data) => {
    let result = false
    data.forEach(d => {
        if (d.type == 'image') {
            result = true
        }
        if (d.children)
            result = result || containsImage(d.children)
    })
    return result
}

const ds = el => {
    if (el.nodeType === 3) {
        // return el.textContent
        return el.textContent.replace(/\r?\n|\r/g, '');
    } else if (el.nodeType !== 1) {
        return null
    } else if (el.nodeName === 'BR') {
        return null
    }
    const { nodeName } = el
    let parent = el


    let children = Array.from(parent.childNodes)
        .map(ds)
        .flat()


    if (children.length === 0) {
        children = [{ text: '' }]
    }

    if (el.nodeName === 'BODY') {
        return jsx('fragment', {}, children)
    }

    if (ELEMENT_TAGS[nodeName]) {
        const attrs = ELEMENT_TAGS[nodeName](el)
        return jsx('element', attrs, children)
    }

    if (TEXT_TAGS[nodeName]) {
        const attrs = TEXT_TAGS[nodeName](el)
        return children.map(child => jsx('text', attrs, child))
    }
    return children
}

const dataClean = data => {
    let arr = [];
    if (Array.isArray(data)) {
        data.forEach((item) => {
            if (item.text && !String(item.text).match(/^[ ]*$/)) {
                arr.push(item)
            } else if (item.type && item.children.length > 0) {
                if (item.type === "image") {
                    arr.push(item)
                } else if (item.children.length == 1 && item.children[0].text && String(item.children[0].text).match(/^[ ]*$/)) {
                    // arr.push(item)
                } else {
                    item.children = dataClean(item.children)
                    if (item.children.length > 0) arr.push(item)
                }
            } else if (item && !item.type && item.type) {
                // arr.push({type:"paragraph",children:[item]})
            }
        })
    }
    return arr
}