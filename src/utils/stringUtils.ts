import { str } from "ajv";

const addrShorten = (addr: string): string => {
    return addr && addr.length > 6 ? addr.substring(0, 6) + '...' + addr.substring(addr.length - 5, addr.length) : null
}

const capitalizeFirstLetter = (text: string): string => {
    return text?.length && text.charAt(0).toUpperCase() + text.slice(1);
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

const unique = (arr: string[]) => {
    let tmp = {}
    arr.forEach(str => tmp[str] = '')
    return Object.keys(tmp)
}

export const fillZero = (x) => ('00' + x).slice(-2);
export { addrShorten, capitalizeFirstLetter, pad ,unique}