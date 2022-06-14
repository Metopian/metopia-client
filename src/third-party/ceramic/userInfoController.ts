import Ceramic from '@ceramicnetwork/http-client'
import { Resolver } from 'did-resolver'
import NftResolver, { NftResolverConfig } from 'nft-did-resolver'
import { ceramicNode } from '../../config/urls'

const ceramic = new Ceramic(ceramicNode)

const config: NftResolverConfig = {
    ceramic,
    chains: {
        'eip155:1': {
            blocks: 'https://api.thegraph.com/subgraphs/name/yyong1010/ethereumblocks',
            skew: 15000,
            assets: {
                erc721: 'https://api.thegraph.com/subgraphs/name/sunguru98/mainnet-erc721-subgraph',
                erc1155: 'https://api.thegraph.com/subgraphs/name/sunguru98/mainnet-erc1155-subgraph',
            },
        },
        'eip155:4': {
            blocks: 'https://api.thegraph.com/subgraphs/name/mul53/rinkeby-blocks',
            skew: 15000,
            assets: {
                erc721: 'https://api.thegraph.com/subgraphs/name/sunguru98/erc721-rinkeby-subgraph',
                erc1155: 'https://api.thegraph.com/subgraphs/name/sunguru98/erc1155-rinkeby-subgraph',
            },
        },
    },
}

const nftResolver = NftResolver.getResolver(config)
const didResolver = new Resolver(nftResolver)
const request = async () => {
    const erc721result = await didResolver.resolve(
        'did:nft:eip155:1_erc721:0x0c07150e08e5deCfDE148E7dA5A667043F579AFC_12'
    )
    return erc721result
}

export { request }
