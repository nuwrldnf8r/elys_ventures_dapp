const networks = {
    avax: {id: 0xa86a, rpc: ''},
    fuji: {id: 0xa869, rpc: 'https://rpc.ankr.com/avalanche_fuji'},
    default: {id: 0xa869, rpc: 'https://rpc.ankr.com/avalanche_fuji'}
}

const get = (chainId) => {
    console.log('**',chainId)
    for(let key in networks){
        console.log(key)
        if(networks[key].id===chainId) return networks[key]
    }
    return null
}

let _networks = Object.assign({},networks)
_networks.get = get

export default _networks