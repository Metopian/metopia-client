
const cdnPrefix = process.env.REACT_APP_CDN_PREFIX

const dataCenterRoot = process.env.REACT_APP_DATA_CENTER_API_PREFIX
const snapshotScoreApiRoot = process.env.REACT_APP_SNAPSHOT_SCORE_API_PREFIX
const snapshotCoreRoot = process.env.REACT_APP_SNAPSHOT_CORE_API_PREFIX
const metopiaApiRoot = process.env.REACT_APP_METOPIA_SERVICE_API_PREFIX

const nftDataApi = {
    nft_image: dataCenterRoot + "nfts/image",
    nft_cache: dataCenterRoot + "nfts/cache",
    nft_cacheAll: dataCenterRoot + "nfts/cache-all",
    nft_attributes: dataCenterRoot + "nfts/attributes",
    goverance_selectByOwner: dataCenterRoot + "owners/governance-records",
}

const snapshotApi = {
    dao_create: metopiaApiRoot + "club/create",
    dao_update: metopiaApiRoot + "club/update",
    dao_select: metopiaApiRoot + "club/select",
    dao_selectById: metopiaApiRoot + "club/selectById",
    proposal_selectLatest: metopiaApiRoot + "proposal/selectLatest",
    uploadImage: metopiaApiRoot + "uploadImage",
    score: snapshotScoreApiRoot + "scores",
    graphql: snapshotCoreRoot + "graphql",
    msg: snapshotCoreRoot + "api/msg",
}


const thirdpartyApi = {
    snapshot_api_graph: "https://hub.snapshot.org/graphql"
}

const localRouter = (name?: string | null, param?: any) => {
    if (name === 'test') return '/alpha/test'
    if (name === 'profile') return '/alpha/profile/'
    if (name === 'ai') return '/ai'
    if (name === 'home') return '/alpha'
    if (name === 'club') return '/alpha/space'
    if (name === 'club.prefix') return '/alpha/space/'
    if (name === 'club.create') return '/alpha/space/create'
    if (name === 'club.update') return `/alpha/space/update/${param.space}`
    if (name === 'proposal.prefix') return '/alpha/proposal/'
    if (name === 'proposal.create') return '/alpha/space/' + param.space + "/propose"
    return "/"
}

const ipfsApi = {
    pinataRoot: "https://api.pinata.cloud/"
}

const ceramicNode = process.env.REACT_APP_CERAMIC_API

export { cdnPrefix, localRouter, nftDataApi, snapshotApi, ipfsApi, ceramicNode, thirdpartyApi }