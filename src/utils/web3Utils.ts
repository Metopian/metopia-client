
import { ethers, utils } from "ethers";
import { defaultChainId } from "../config/constant";

let provider = null
export const getProvider = () => {
    if (!provider) {
        if ((window as any).ethereum) {
            provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const tmp = () => {
                provider = null
            }
            (window as any).ethereum.on('chainChanged', tmp);
            (window as any).ethereum.on('accountsChanged', tmp)

            // window.ethereum.removeListener('chainChanged', chainChangedHander.current)
            // window.ethereum.removeListener('accountsChanged', accountsChangedHander.current)
        } else {
            window.alert("Please install web3 wallet.")
            throw new Error("Please install web3 wallet.");
        }
    }
    return provider
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

// export const useSelf = ()=>{
//     const {data}
// }

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

export const hashWithPrefix = (msg) => {
    return utils.keccak256("\u0019Ethereum Signed Message:\n" + msg.length + msg)
}

export const sign = async (msg) => {
    return await getProvider().getSigner().signMessage(msg)
}

export const signTypedData = async (message, types, domain) => {
    // @ts-ignore
    let address = await getAddress()
    const signer = getProvider().getSigner();
    if (!message.from) message.from = address;
    if (!message.timestamp)
        message.timestamp = parseInt((Date.now() / 1e3).toFixed());
    const data: any = { domain, types, message };
    const sig = await signer._signTypedData(domain, data.types, message);
    return { address, sig, data }
}

export const ifConnectedCheckChainAndSwitch = async (chainId) => {
    if (getAddress(true)) {
        let current = await getChainId();
        if (current !== chainId) {
            switchChain(chainId)
        }
    }
}

export const getEns = async (address): Promise<string> => {
    if (!address.length)
        return ''
    const ens = localStorage.getItem(address);
    if (ens?.length)
        return ens;

    return await getProvider().lookupAddress(address).then(e => {
        if (e)
            localStorage.setItem(address, e);
        return e
    }).catch(e => {
        console.error(e)
        return ''
    })
}

export const fromEns = async (ens): Promise<string> => {
    if (!ens.length)
        return ''
    const address = localStorage.getItem(ens);
    if (address?.length)
        return address;

    await getProvider().getResolver(ens).then(e => {
        return e.getAddress()
    }).then(address => {
        if (!address?.length)
            return ''
        localStorage.setItem(ens, address);
        return address
    }).catch(e => {
        console.error(e)
        return ''
    })
}

export const getContract = (contractAddress, abi, providerOrSigner?) => {
    return new ethers.Contract(contractAddress, abi, providerOrSigner || getProvider());
}
