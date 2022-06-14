
const defaultSWRConfig = {
    refreshInterval: 0,
    revalidateOnFocus: false
}

const encodeQueryData = (url, data) => {
    if (!data || !Object.keys(data))
        return url
    const ret = [];
    for (let d in data)
        if (data[d])
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return url + "?" + ret.join('&');
}

const getFetcher = (url, params?) => fetch(encodeQueryData(url, params)).then((res) => res.json())

const postFetcher = (url, params) => fetch(url, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
        'content-type': "application/json"
    }
}).then((res) => res.json())


export { defaultSWRConfig, encodeQueryData, getFetcher, postFetcher }