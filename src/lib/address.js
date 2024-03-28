import axios from 'axios'
import {ethers} from 'ethers'
const endpoint = "/.netlify/functions"

export const hashAddress = (web3address) => {
    let hash = ethers.utils.sha256(web3address)
    return hash.substring(2,34)
}

export const saveAddress = async (web3address, address) => {
    try{
        console.log('here')
        console.log(address)
        let body = {address: hashAddress(web3address), data: address}
        console.log(body)
        await axios.post(`${endpoint}/address`,body)
    } catch(e){
        console.log(e.message)
        return e.message
    }
}

export const getAddress = async (web3address) => {
    try{
        const ret = await axios.get(`${endpoint}/address?address=${hashAddress(web3address)}`)
        return ret.data
    } catch(e) {
        return {}
    }
}