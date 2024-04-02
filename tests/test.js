const ethers = require('ethers')
const abi = require('./lib/abi')
const bytecode = require('./lib/bytecode')
const fs = require('fs').promises
const addressesPath = './lib/addresses.json'

let addresses

const pks = require('./lib/pks')

const rpcEndPoint = 'https://rpc.ankr.com/avalanche_fuji'
const provider = new ethers.providers.JsonRpcProvider(rpcEndPoint)

const ownerWallet = new ethers.Wallet('2ea2f9bacb8ef51fe262ddb35c8d97ad069106c6d37d6c3db885ee57361ef8da',provider)



const maxTOAs = 10
const priceOfTOAs = 1500 * 1e6
const minTOAsSoldThreshold = 5
const campaignLengthDays = 3
const metadataTOA = ''
const metadataCrowdsaleToken = ''

const toBN = (n,dec) => {
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

const getAddresses = async () => {
    let file = await fs.readFile(addressesPath)
    addresses = JSON.parse(file)
}

const updateAddresses = async () => {
    fs.writeFile(addressesPath,JSON.stringify(addresses))
}

const confirm = (txhash) => {
    console.log('....awaiting confirmation')
    return new Promise(r=>provider.once(txhash,()=>r()))
}

const checkBalanceAndTopUp = async (pk, usdcNeeded) => {
    const w = new ethers.Wallet(pk,provider)
    let bal = await w.getBalance()
    console.log('topping up')
    if(bal.lt(ethers.utils.parseEther('0.1'))){
        let amnt = ethers.utils.parseEther('0.1')
        const transaction = {
            to: w.address,
            value: amnt,
        }
        const signedTransaction = await ownerWallet.sendTransaction(transaction)
        await confirm(signedTransaction.hash)
    }
    
    console.log('Checking USDC balance')
    let usdcBal = await getUSDCbal(w.address)
    if(usdcBal.lt(usdcNeeded)){
        console.log('minting more usdc')
        let required = usdcNeeded.sub(usdcBal)
        await mintUSDC(w.address,required)
    }
    console.log('checking allowance')
    let allowance = await getAllowance(w.address)
    if(allowance.lt(usdcNeeded)){
        await setAllowance(pk, usdcNeeded.sub(allowance))
    }
}

const mintUSDC = async (to, amnt) => {
    console.log('minting usdc')
    //console.log(addresses.usdc)
    const contract = new ethers.Contract(addresses.usdc, abi.usdc, ownerWallet)
    let tx = await contract.mint(to,amnt)
    await confirm(tx.hash)
}

const getUSDCbal = async (address) => {
    const contract = new ethers.Contract(addresses.usdc, abi.usdc, ownerWallet)
    let usdcBal = await contract.balanceOf(address)
    console.log(usdcBal)
    return usdcBal
}

const setAllowance = async (pk, amnt) => {
    console.log('setting allowance')
    const w = new ethers.Wallet(pk,provider)
    const contract = new ethers.Contract(addresses.usdc, abi.usdc, w)
    let tx = await contract.approve(addresses.crowdsale,amnt)
    await confirm(tx.hash)
}

const getAllowance = async (address) => {
    const contract = new ethers.Contract(addresses.usdc, abi.usdc, ownerWallet)
    let allowance = await contract.allowance(address, addresses.crowdsale)
    return allowance
}

const deployUSDC = async () => {
    console.log('deploying usdc')
    const factory = new ethers.ContractFactory(abi.usdc, bytecode.usdc, ownerWallet)
    const contract = await factory.deploy();
    await confirm(contract.deployTransaction.hash)
    addresses.usdc = contract.address;
    await updateAddresses()
}

const deployCrowdsale = async () => {
    console.log('deploying crowdsale')
    const factory = new ethers.ContractFactory(abi.crowdsale, bytecode.crowdsale, ownerWallet)
    //   string memory metadataTOA, string memory metadataCrowdsale
    const contract = await factory.deploy(addresses.usdc,toBN(maxTOAs),toBN(priceOfTOAs),toBN(minTOAsSoldThreshold), toBN(campaignLengthDays),metadataTOA,metadataCrowdsaleToken);
    await confirm(contract.deployTransaction.hash)
    addresses.crowdsale = contract.address;
    addresses.TOA = await contract.TOAAddress()
    addresses.crowdsaleToken = await contract.crowdsaleTokenAddress()
    await updateAddresses()
}

const startCrowdsale = async () => {
    console.log('starting crowdsale')
    const adminWallet = new ethers.Wallet(pks[0],provider)
    
    const contract = new ethers.Contract(addresses.crowdsale, abi.crowdsale, ownerWallet)
    let tx = await contract.start(adminWallet.address)
    await confirm(tx.hash)
}

const buyTOA = async (pk, amnt) => {
    const w = new ethers.Wallet(pk,provider)
    
    let usdcAmnt = toBN(priceOfTOAs * amnt)
    await checkBalanceAndTopUp(pk, usdcAmnt)
    //await mintUSDC(w.address, usdcAmnt)
    const contract = new ethers.Contract(addresses.crowdsale, abi.crowdsale, w)
    console.log('purchasing ' + amnt + ' TOAs')
    let tx = await contract.purchase(toBN(amnt))
    await confirm(tx.hash)
}

//functionn start(address adminAccount) public onlyOwner{
//function campaignLength() public view returns (uint256){
//function timeLeft() public view returns (uint256){
//function canPurchase(uint256 toPurchase) public view returns (bool){
//function minTOAsSoldThreshold() public view returns (uint256){
//function minSold() public view returns (bool){
//function numSold() public view returns (uint256){

//function purchase(uint256 toPurchase) public {

//function USDCBalance() public view returns (uint256){
//function withdrawUSDC() public {
//function assignTOAs() public {

//function TOAAddress() public view returns (address){
//function crowdsaleTokenAddress() public view returns (address){
//function updateTOAMetadata(string memory metadata) public onlyOwner{

//function updateCrowdsaleTokenMetadata(string memory metadata) public onlyOwner{


//test
//function test_addDays(uint256 numDays) public {

const addDays = async (numDays) => {
    console.log('adding ' + numDays + ' days')
    const contract = new ethers.Contract(addresses.crowdsale, abi.crowdsale, ownerWallet)
    let tx = await contract.test_addDays(toBN(numDays))
    await confirm(tx.hash)
}

const getStatus = async () => {
    const contract = new ethers.Contract(addresses.crowdsale, abi.crowdsale, ownerWallet)
    let [campaignLength, timeLeft, minTOAsSoldThreshold, minSold, numSold] = await Promise.all([
        contract.campaignLength(),
        contract.timeLeft(),
        contract.minTOAsSoldThreshold(),
        contract.minSold(),
        contract.numSold()
    ])
    return {
        campaignLength: campaignLength.toNumber(), 
        timeLeft: timeLeft.toNumber(), 
        minTOAsSoldThreshold: minTOAsSoldThreshold.toNumber(), 
        minSold, 
        numSold: numSold.toNumber()
    }
}

const getCrowdsaleTokenBalance = async (pk) => {
    const w = new ethers.Wallet(pk,provider)
    const contract = new ethers.Contract(addresses.crowdsaleToken, abi.crowdsaleToken, w)
    return await contract.balanceOf(w.address)
}

const getTOABalance = async (pk) => {
    const w = new ethers.Wallet(pk,provider)
    const contract = new ethers.Contract(addresses.TOA, abi.toa, w)
    return await contract.balanceOf(w.address)
}

const assignTOAs = async (pk) => {
    console.log('assigning TOAs')
    const w = new ethers.Wallet(pk,provider)
    const contract = new ethers.Contract(addresses.crowdsale, abi.crowdsale, w)
    let tx = await contract.assignTOAs()
    await confirm(tx.hash)
    let [crowdsaleTokenBal, toaBalance] = await Promise.all([getCrowdsaleTokenBalance(pk),getTOABalance(pk)])
    console.log('crowdsale token balance: ' + crowdsaleTokenBal)
    console.log('toa balance: ' + toaBalance)
    
}

const succesfulCampaign = async () => {
    /*
    await deployCrowdsale()
    await startCrowdsale()
    await buyTOA(pks[1],1)
    let tokenBalance = await getCrowdsaleTokenBalance(pks[1])
    console.log('tokenBalance: ' + tokenBalance)
    let status = await getStatus()
    console.log(status)
    
    await addDays(2)
    await buyTOA(pks[2],3)
    tokenBalance = await getCrowdsaleTokenBalance(pks[2])
    console.log('tokenBalance: ' + tokenBalance)
    status = await getStatus()
    console.log(status)
    

    await addDays(5)
    await buyTOA(pks[3],2)
    tokenBalance = await getCrowdsaleTokenBalance(pks[3])
    console.log('tokenBalance: ' + tokenBalance)
    status = await getStatus()
    console.log(status)
    
    
    await assignTOAs(pks[1])
    await assignTOAs(pks[2])
    await assignTOAs(pks[3])
    
    */
    const w = new ethers.Wallet(pks[0],provider)
    /*
    let status = await getStatus()
    console.log(status)
    
    let expectedBalance = toBN(status.numSold * priceOfTOAs)    
    */
    const contract = new ethers.Contract(addresses.crowdsale, abi.crowdsale, w)
    /*
    let usdcBal = await contract.USDCBalance()
    
    if(!expectedBalance.eq(usdcBal)){
        console.log('balance not equal')
        return
    }
    console.log('fetching current balance')
    let currentBalance = await getUSDCbal(w.address)
    console.log(currentBalance.toString())
    console.log('withdrawing usdc')
    let tx = await contract.withdrawUSDC()
    await confirm(tx.hash)
    let finalBalance = await getUSDCbal(w.address)
    if(!finalBalance.sub(currentBalance).eq(expectedBalance)){
        console.log('invalid balance')
        return
    }
    console.log('valid balance')
    */
    
    //await buyTOA(pks[3],1)
    
    let expectedBalance = await contract.USDCBalance()
    let currentBalance = await getUSDCbal(w.address)
    console.log('withdrawing usdc')
    let tx = await contract.withdrawUSDC()
    await confirm(tx.hash)
    let finalBalance = await getUSDCbal(w.address)
    if(!finalBalance.sub(currentBalance).eq(expectedBalance)){
        console.log('invalid balance')
        return
    }
    console.log('valid balance')
    
    /*
    let tokenBalance = await getCrowdsaleTokenBalance(pks[3])
    let toaBalance = await getTOABalance(pks[3])
    console.log('crowdsale token balance: ' + tokenBalance)
    console.log('toa balance: ' + toaBalance)
    await assignTOAs(pks[3])
    */
}

const changeMeta = async () => {
    const contract = new ethers.Contract(addresses.crowdsale, abi.crowdsale, ownerWallet)
    let tx = await contract.updateCrowdsaleTokenMetadata('https://elysventures.netlify.app/metadata/crowdsale_token_metadata.json')
    await confirm(tx.hash)
    tx = await contract.updateTOAMetadata('https://elysventures.netlify.app/metadata/toa_metadata.json')
    await confirm(tx.hash)
    //http://localhost:3000/metadata/crowdsale_token_metadata.json
}

const status = async () => {
    const w = new ethers.Wallet(pks[0],provider)
    const contract = new ethers.Contract(addresses.crowdsale, abi.crowdsale, w)
    return await contract.status()
}

const run = async () => {
    await getAddresses()
    //let _status = await status()
    //console.log(_status)

    /*
    //await deployUSDC()
    await deployCrowdsale()
    await startCrowdsale()
   
    await buyTOA(pks[1],1)
    await buyTOA(pks[2],3)
    await addDays(2)
    let status = await getStatus()
    console.log(status)
    */
    //await succesfulCampaign()

    
    //await deployCrowdsale()
    await startCrowdsale()
    
    //await changeMeta()
    
   
}

run().then()