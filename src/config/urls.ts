
const cdnPrefix = process.env.REACT_APP_CDN_PREFIX

const dataCenterRoot = process.env.REACT_APP_DATA_CENTER_API_PREFIX
const snapshotScoreApiRoot = process.env.REACT_APP_SNAPSHOT_SCORE_API_PREFIX
const snapshotCoreRoot = process.env.REACT_APP_SNAPSHOT_CORE_API_PREFIX
const metopiaApiRoot = process.env.REACT_APP_METOPIA_SERVICE_API_PREFIX

const userApi = {
    user_update: dataCenterRoot + "owners/",
    user_selectByOwner: dataCenterRoot + "owners/"
}
const discordApi = {
    guild_selectAll: dataCenterRoot + 'discord/bot/guilds',
    role_select: dataCenterRoot + 'discord/guilds/roles',
    personal_auth: dataCenterRoot + "discord/auth"
}

const nftDataApi = {
    nft_image: dataCenterRoot + "nfts/image",
    nft_cache: dataCenterRoot + "nfts/cache",
    nft_cacheAll: dataCenterRoot + "nfts/cache-all",
    nft_transfer_cacheAll: dataCenterRoot + "nfts/transfers/cache-all",
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
    loadSpaces: snapshotCoreRoot + "api/loadspaces"
}

const thirdpartyApi = {
    snapshot_api_graphql: "https://hub.snapshot.org/graphql",
}

const localRouter = (name?: string | null, param?: any) => {
    if (name === 'test') return '/alpha/test'
    if (name === 'profile') return '/alpha/profile/'
    if (name === 'ai') return '/ai'
    if (name === 'home') return '/alpha'
    if (name === 'dao') return '/alpha/dao'
    if (name === 'dao.prefix') return '/alpha/dao/'
    if (name === 'dao.create') return '/alpha/dao/create'
    if (name === 'dao.update') return `/alpha/dao/update/${param.dao}`
    if (name === 'proposal.prefix') return '/alpha/proposal/'
    if (name === 'proposal.create') return '/alpha/dao/' + param.dao + "/propose"
    return "/"
}
const pinataApiPrefix = "https://api.pinata.cloud/"

const ipfsApi = {
    pinata_pinFileToIPFS: pinataApiPrefix + "pinning/pinFileToIPFS"
}

const testApi = {
    image_store: metopiaApiRoot + "uploadImage",
    membership_mint: metopiaApiRoot + "test/membership/mint",
    membership_select: metopiaApiRoot + "test/membership/select/"
}

const ceramicNode = process.env.REACT_APP_CERAMIC_API


export { cdnPrefix, localRouter, nftDataApi, snapshotApi, ipfsApi, ceramicNode, thirdpartyApi, testApi, discordApi, userApi }