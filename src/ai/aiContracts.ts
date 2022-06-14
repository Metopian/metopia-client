import { Signature } from '../config/type/web3Type';
import { hashWithPrefix } from '../utils/web3Utils';

const addr = "0xf91a8c71A5b73b1cB09f43972a5B79Eb0D7B32AD"

const getCoreContract = (funcName) => {
    let Contract = require('web3-eth-contract');
    let coreContract = require('../config/abi/RedeemCodeFactory.json');

    Contract.setProvider((window as any).ethereum);
    var contract = new Contract(coreContract.abi, addr);
    if (funcName)
        return contract.methods[funcName]
    else return contract
}

const payforAI = async (account, quote_chainId, quote_contract, quote_tokenId) => {
    let func = getCoreContract('payforAI')
    await func(quote_chainId, quote_contract, quote_tokenId).send({
        from: account, maxPriorityFeePerGas: null,
        maxFeePerGas: null,
    }, (err, result) => {
        console.log(err, result)
    })
}

const doVerifyWhitelist = async (message, signature) => {
    let func = getCoreContract('verifyWhitelist')
    return await func(message, signature).call((err, res) => {
        console.log(err, res)
    })
}

const doMint = async (account, message, signature, quote_chainId, quote_contract, quote_tokenId) => {
    let func = getCoreContract('mint')
    await func(message, signature, quote_chainId, quote_contract, quote_tokenId).send({
        from: account, maxPriorityFeePerGas: null,
        maxFeePerGas: null,
    }, (err, result) => {
        console.log(err, result)
    })
}

const balanceOf = async (account) => {
    let func = getCoreContract('balanceOf')
    return await func(account).call((err, res) => {
        console.log(err, res)
    })
}

const verifyWhitelist = async (invitationCode: string, setLoading: { (boolean): void }) => {
    if (!invitationCode)
        return false
    if (invitationCode.split(',').length !== 2) {
        alert('The code is incorrect.')
        return false
    }
    let message = hashWithPrefix(invitationCode.split(',')[0])
    let signature = invitationCode.split(',')[1]
    setLoading(true)
    let flag = true
    try {
        // flag = (await recover(message, signature))=='0x609ca19F1a3eaBB08C700Cde3DfD71d682153272'
        flag = await doVerifyWhitelist(message, signature)
    } catch (err) {
        console.log(err)
        flag = false
    }
    setLoading(false)
    if (!flag) {
        alert('The code is incorrect.')
        return false
    }

    setLoading({ message, signature })
    return { message, signature }
}

const wl_mint = async (account: string, chainId: string, nftAddr: string, tokenId: string, setLoading: { (boolean): void }, callback?) => {
    setLoading(true)
    console.log(account, chainId, nftAddr, tokenId)
    try {
        let func = getCoreContract('wl2_mint')
        await func(chainId, nftAddr, tokenId).send({
            from: account, maxPriorityFeePerGas: null,
            maxFeePerGas: null,
        }, (err, result) => {
            console.log(err, result)
        })
        setLoading(false)
        if (callback)
            callback()
    } catch (err) {
        console.error(err)
        setLoading(false)
    }
}
const mint = async (account: string, signature: Signature, chainId: string, nftAddr: string, tokenId: string, setLoading: { (boolean): void }, callback?) => {
    setLoading(true)
    try {
        await doMint(account, signature.message, signature.signature, chainId, nftAddr, tokenId)
        setLoading(false)
        callback()
    } catch (err) {
        console.error(err)
        setLoading(false)
    }
}

const generateAiImage = async (account, chainId: string, nftAddr: string, tokenId: string, setLoading: { (boolean): void }, callback?) => {
    try {
        await payforAI(account, chainId, nftAddr, tokenId)
        setLoading(false)
        callback()

    } catch (err) {
        console.error(err)
        setLoading(false)
    }
}

const getWhiteListAddress = async (account, setLoading: { (boolean): void }) => {
    try {
        let func = getCoreContract('getWhiteListAddress')
        return await func(account).call()
    } catch (err) {
        console.error(err)
    }
}

export { mint, balanceOf, verifyWhitelist, generateAiImage, getWhiteListAddress, wl_mint };

