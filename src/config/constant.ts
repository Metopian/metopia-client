
const chainMap = {
    '0x4': 'Rinkeby',
    '0x1': 'Ethereum',
    '0x3': 'Ropsten',
    '0x5': 'Goerli',
    '0x2a': 'Kovan',
    '0x89': 'Polygon',
    '0x13881': 'Mumbai',
    '0x38': 'BSC',
    '0x61': 'BSC Testnet',
    '0xa86a': 'Avalanche',
    '0xfa': 'Fantom',
}
const chainRpcMap = {
    '0x1': 'https://mainnet.infura.io/v3/',
    '0x4': 'https://rinkeby.infura.io/v3/',
    '0x89': 'https://polygon-rpc.com/'
}

const chainExplorerMap = {
    '0x1': 'https://etherscan.io/address/',
    '0x4': 'https://rinkeby.etherscan.io/',
    '0x89': 'https://polygonscan.com/address/'
}

const aiErrors = {
    '1': 'Face is not recognized by AI', // image = None(ai server error)
    '2': 'Metadata is not tracked by Metopia',
    '3': 'Image format is not supported',
    '4': 'Face is not recognized by AI',
}

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY
const moralisApiToken = "2vqCa6qnbRHsbmoA7WdO94dNxkhFFJfSQWY7xPaKtmx3IwuU3K8TKmoIbM5R5PAZ"
const chainId = process.env.REACT_APP_CHAIN_ID
export { chainMap, chainExplorerMap, aiErrors, pinataApiKey, pinataSecretApiKey, moralisApiToken, chainId, chainRpcMap }