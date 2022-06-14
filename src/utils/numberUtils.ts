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


export { numberToLetter, toFixedIfNecessary, sum }