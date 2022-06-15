
import { ethers, utils } from "ethers";
import { Web3Provider } from "ethers/node_modules/@ethersproject/providers";
import { chainId as defaultChainId } from "../config/constant";

let provider: Web3Provider = null
export const getProvider = () => {
    if (!provider) {
        if ((window as any).ethereum) {
            provider = new ethers.providers.Web3Provider((window as any).ethereum)
        } else {
            window.alert("Please install web3 wallet.")
            throw new Error("Please install web3 wallet.");
        }
    }
    return provider
    // const provider = new ethers.providers.Web3Provider(window.ethereum)
}

export const getAddress = async (light?: boolean) => {
    const addresses = await getProvider().listAccounts();
    if (addresses.length > 0)
        return addresses[0]
    if (light)
        return null
    let accounts = await getProvider().send("eth_requestAccounts", []);
    let account = utils.getAddress(accounts[0])
    return account
}

export const getChainId = async () => {
    return await getProvider().send("eth_chainId", [])
}

export const switchChain = async (chainId?) => {
    await getProvider().send("wallet_switchEthereumChain", [
        {
            chainId: chainId || defaultChainId
        }]
    )
}

export const getContract = (contractAddress, abi) => {
    return new ethers.Contract(contractAddress, abi, getProvider());
}
export const hashWithPrefix = (msg) => {
    return utils.keccak256("\u0019Ethereum Signed Message:\n" + msg.length + msg)
}

export const sign = async (msg) => {
    return await getProvider().getSigner().signMessage(msg)
}