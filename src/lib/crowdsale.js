import abi from './abi'
import networks from './networks'
import {ethers} from 'ethers'
import contracts from './contracts'
import axios from 'axios'

const getProvider = (chainId) => new ethers.providers.JsonRpcProvider(networks.get(chainId).rpc)
const contractAddress = (contract, chainId) => contracts[chainId][contract]
const contractObject = (contract, chainId, provider) => new ethers.Contract(contractAddress(contract, chainId), abi[contract], provider)

export const toBN = (n,dec) => {
    if(dec===undefined) return ethers.BigNumber.from(n.toString())
    let fAr = parseFloat(n).toString().split('.')
    let bn
    if(fAr.length===1){
        bn = ethers.BigNumber.from(n.toString())
    } else {
        dec -= fAr[1].length
        bn = ethers.BigNumber.from(fAr.join(''))
    }
    let d = ethers.BigNumber.from((10**dec).toString())
    return bn.mul(d)
}

const confirm = (txhash, chainId) => {
    console.log('....awaiting confirmation')
    const provider = getProvider(chainId)
    return new Promise(r=>provider.once(txhash,()=>r()))
}

export const USDCBalance = async (chainId, account) => {
    const contract = contractObject('usdc', chainId, getProvider(chainId))
    const bal = await contract.balanceOf(account)
    return bal
}

export const getStatus = async (chainId) => {
    if(!chainId) chainId = networks.default.id
    const contract = contractObject('crowdsale', chainId, getProvider(chainId))
    console.log('***********************',contract)
    
    try{
        let [campaignLength, timeLeft, minTOAsSoldThreshold, minSold, numSold, maxTOAs,priceOfTOAs] = await contract.status()
        
        const _status = {
            campaignLength: campaignLength.toNumber(), 
            timeLeft: timeLeft.toNumber(), 
            minTOAsSoldThreshold: minTOAsSoldThreshold.toNumber(), 
            minSold, 
            numSold: numSold.toNumber(),
            maxTOAs: maxTOAs.toNumber(),
            priceOfTOAs: priceOfTOAs.toNumber()
        }
        console.log(_status)
        return _status
    } catch(e){
        console.log('here')
        console.log(e)
    }
    
}

export const setAllowance = async (provider, account, amount) => {
    try{
        console.log('setting allowance')
        const chainId = provider.provider._network.chainId
        contractObject('usdc', chainId, provider)
        const contract = contractObject('usdc', chainId, provider)
        let tx = await contract.approve(contracts[chainId]['crowdsale'],amount)
        await confirm(tx.hash, chainId)
    } catch (e){
        console.log(e)
        throw e
    }
}


export const buyTOAs = async (provider, numTOAs) => {
    try{
        console.log('purchasing ' + numTOAs + ' TOAs')
        const chainId = provider.provider._network.chainId
        const contract = contractObject('crowdsale', chainId, provider)   
        let tx = await contract.purchase(toBN(numTOAs))
        await confirm(tx.hash, chainId)
    } catch(e){
        console.log(e)
        throw e
    }
}

const getOgTOAs = async (account) => {
    return []
}

export const getTokens = async (chainId, account) => {
    console.log(chainId)
    console.log('getting tokens for ' + account)
    const provider = getProvider(chainId)
    console.log('provider: ', provider)
    const contract = contractObject('crowdsale', chainId, provider) 
    const [crowdsaleTokenAddress, toaAddress] = await Promise.all([
        contract.crowdsaleTokenAddress(),
        contract.TOAAddress()
    ])

    console.log('addresses: ',crowdsaleTokenAddress, toaAddress)
    const crowdsaleToken = new ethers.Contract(crowdsaleTokenAddress, abi.crowdsaleToken, provider)
    const toa = new ethers.Contract(toaAddress, abi.toa, provider)

    const getMetadata = async (uri) => {
        if(uri==='') return {}
        try{
            let ret = await axios.get(uri)
            return ret.data
        } catch(e){
            console.log(e)
            return {}
        }
    } 

    const get = async (c, address, chainId) => {
        let numTokens = await c.balanceOf(account)
        numTokens = numTokens.toNumber()
        console.log('num tokens: ' + numTokens)
        
        if(numTokens>0){
            let ar = []
            for(let i=0;i<numTokens;i++){
                ar.push(i)
            }
            console.log(ar)
            let arTokens = await Promise.all(ar.map(i=>c.tokenOfOwnerByIndex(account, i)))
            console.log(arTokens)
            let metadataURLAr = await Promise.all(arTokens.map(tokenId=>c.tokenURI(tokenId)))
            console.log(metadataURLAr)
            let metadataAr = await Promise.all(metadataURLAr.map(uri=>getMetadata(uri)))
            console.log(metadataAr)
            return arTokens.map((tokenId,i)=>{return {tokenId,metadata: metadataAr[i], address, chainId}})
        }
        
       return []
    }

    /*
    const [crowdsaleTokens, toas, ogTOAs] = await Promise.all([
        get(crowdsaleToken), get(toa), getOgTOAs(account)
    ])
    */
   console.log('getting crowdsale tokens')
   let crowdsaleTokens = await get(crowdsaleToken,crowdsaleTokenAddress,chainId)
   console.log('getting toas')
   let toas = await get(toa,toaAddress,chainId)
   console.log('getting og toas')
   let ogTOAs = await getOgTOAs(account)

    return {crowdsaleTokens, toas, ogTOAs}
}


export const assignTOAs = async (provider) => {
    const chainId = provider.provider._network.chainId
    const contract = contractObject('crowdsale', chainId, provider)
    try{
        const tx = await contract.assignTOAs()
        await confirm(tx.hash, chainId)
    } catch(e){
        console.log(e)
        throw e
    }
} 

export const withdrawUSDC = async (provider) => {
    const chainId = provider.provider._network.chainId
    const contract = contractObject('crowdsale', chainId, provider)
    try{
        const tx = await contract.withdrawUSDC()
        await confirm(tx.hash, chainId)
    } catch(e){
        console.log(e)
        throw e
    }
}










export const mintUSDC = async (provider, account, amount) => {
    
    const chainId = provider.provider._network.chainId
    if(chainId !== networks['fuji'].id) throw new Error('Needs to be test network')
    const contract = contractObject('usdc', chainId, provider)
    let ret = await contract.mint(account,amount)
    await confirm(ret.hash, chainId)
    
}

export const addDay = async (provider) => {
    const chainId = provider.provider._network.chainId
    if(chainId !== networks['fuji'].id) throw new Error('Needs to be test network')
    const contract = contractObject('crowdsale', chainId, provider)
    let ret = await contract.test_addDays(toBN(1))
    await confirm(ret.hash, chainId)
}
