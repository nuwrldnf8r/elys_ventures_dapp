const { Actor, HttpAgent } = require('@dfinity/agent')
const {Secp256k1KeyIdentity} = require('@dfinity/identity-secp256k1')
const ec = require('elliptic').ec
const crypto = require('crypto')


const encrypt = (data, address) => {
  
  let kp = getKeyPair()
  const keyBuffer = Buffer.from(kp.privateKeyHex, 'hex');
  const ivBuffer = Buffer.from(address.substring(0,32), 'hex')
  console.log(ivBuffer)
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer,ivBuffer)
  let ciphertext = cipher.update(JSON.stringify(data), 'utf8', 'base64')
  ciphertext += cipher.final('base64')
  console.log('done')
  return ciphertext
  
}

const decrypt = (data, address) => {
  
  console.log('dencrypting')
  let kp = getKeyPair()
  const keyBuffer = Buffer.from(kp.privateKeyHex, 'hex');
  const ivBuffer = Buffer.from(address, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer,ivBuffer)
  let plaintext = decipher.update(data, 'base64', 'utf8');
  plaintext += decipher.final('utf8')
  console.log('done')
  return JSON.parse(plaintext)
  
}

const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'get' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Nat8)], ['query']),
    'get_from_index' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Nat8)], ['query']),
    'index' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
    'upload' : IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Text], []),
  });
};

const canisterId = 'gtqvw-rqaaa-aaaak-afn6a-cai' //'ajuq4-ruaaa-aaaaa-qaaga-cai'
const host =  'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=gtqvw-rqaaa-aaaak-afn6a-cai'

const getKeyPair = () => {
  const secret = process.env.SECRET
  console.log('secret:',secret)
  console.log('salt:', process.env.IDENTITY_SALT)
  const privateKeyBuffer = crypto.createHmac('sha256', process.env.IDENTITY_SALT)
    .update(secret)
    .digest()

  const privateKeyHex = privateKeyBuffer.toString('hex')
  const secp256k1 = new ec('secp256k1');
  const keyPair = secp256k1.keyFromPrivate(privateKeyHex, 'hex')
  ;
  const publicKeyHex = keyPair.getPublic('hex')
  return {privateKeyHex, publicKeyHex}
}

const getIdentity = async () => {
  //const kp = getKeyPair()
  const mnemonic = process.env.SECRET //bip39.entropyToMnemonic(kp.privateKeyHex)
  console.log('secret: ',mnemonic)
  return await Secp256k1KeyIdentity.fromSeedPhrase(mnemonic)
}

const createActor = async () => {
  const identity = await getIdentity()
  console.log(host)

  try{
    let agent = new HttpAgent({fetch, host, identity})
    return Actor.createActor(idlFactory, {
      agent,
      canisterId,
      verifyQuerySignatures: false,
      verifyUpdateSignatures: false,
    }, )
  } catch(e){
    return {error: e.message}
  }
}



exports.handler = async (event, context) => {
    
    if(event.httpMethod==='POST'){
        console.log('here')
        try{
            const body = JSON.parse(event.body) 
            if(body.address && body.data){
              console.log(body.address, body.data)
              let actor = await createActor()
              let address = body.address
              
              await actor.index(address, Buffer.from(encrypt(body.data,body.address)))
              
              return { statusCode: 200, body: JSON.stringify({success: true}) }
            }
            return {statusCode: 400, body: JSON.stringify({error: 'Invalid parameters'})}
        } catch(e){
          console.log(e.message)
          return {statusCode: 400, body: JSON.stringify({error: e.message})}
        }
    } else {
        const params = event.queryStringParameters
        try{
          if(params.address){
            let actor = await createActor()
            console.log(actor)
            let address = params.address
            console.log('account:', address)
            let ret = await actor.get_from_index(address)
            console.log(ret)
            let b = Buffer.from(ret)
            let data = decrypt(b.toString(),params.address)
            //let data = b.toString()
            return { statusCode: 200, body: JSON.stringify(data)}
          }
          return {statusCode: 400, body: JSON.stringify({error: 'Invalid parameters'})}
        } catch(e){
          console.log(e)
          return {statusCode: 400, body: JSON.stringify({error: e.message})}
        }
    }
    
}