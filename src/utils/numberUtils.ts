const numberToLetter = (num) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    } else {
        return num
    }
}

function toFixedIfNecessary(value, dp) {
    return +parseFloat(value).toFixed(dp);
}

const sum = (array) => {
    let sum = 0
    array?.forEach(ele => {
        sum += ele
    });
    return sum
}

const max = (array, keyword?:string) => {
    let res = -1
    array?.forEach(ele => {
        if (keyword) {
            if (ele[keyword] > res)
                res = ele[keyword]
        } else {
            if (ele > res)
                res = ele
        }
    });
    return res
}


export { numberToLetter, toFixedIfNecessary, sum, max }