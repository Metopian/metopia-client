function extractContent(s) {
    if (!s)
        return ''
    let span = document.createElement('span');
    span.innerHTML = s;
    let result = (span.textContent || span.innerText || '').trim()
    return result
}

function extractBrief(s, length) {
    if (!s)
        return ''
    if (!length)
        length = 200
    let text = extractContent(s)
    if (!text)
        return ''
    if (text.length > length) {
        text = text.substr(0, length)
    }
    return text
}

function strContainsImg(s) {
    return s && s.indexOf("<img") >= 0
}

export { extractContent, extractBrief, strContainsImg };
