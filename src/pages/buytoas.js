import Button from '../components/button'
import {BackIcon, NextIcon} from '../icons/icons'
import {useState} from 'react'
import Status from '../components/status'
import {setAllowance, buyTOAs as buyTOAs_, toBN} from '../lib/crowdsale'

const BuyTOAs = (props) => {
    const [numTOAs, setNumTOAs] = useState(0)
    const [progressStage, setProgressStage] = useState(0)
    const [showStatus, setShowStatus] = useState(false)
    const [current, setCurrent] = useState(0)
    const [error, setError] = useState(null)
    const cloneAddress = () => {
        if(props.address){
            return {
                fullName: props.address.fullName||'',
                streetAddressLine1: props.address.streetAddressLine1||'',
                streetAddressLine2: props.address.streetAddressLine2||'',
                city: props.address.city||'',
                state_province_region: props.address.state_province_region||'',
                country: props.address.country||'',
                postal_zip: props.address.postal_zip||'',
                mobile: props.address.mobile||''
            }
        } else {
            return {}
        }
        
    }
    const [address, setAddress] = useState(cloneAddress())
    //console.group(props.chainId)

    const TOAsLeft = () => props.crowdsaleStatus.maxTOAs-props.crowdsaleStatus.numSold
    const numAllowed = (num) => {
        return (num <= TOAsLeft())&&(props.usdcBalance - props.crowdsaleStatus.priceOfTOAs*numTOAs>=0)
    }

    const allowedNum = () => {
        if(props.usdcBalance<props.crowdsaleStatus.priceOfTOAs) return 0
        let canBuy = parseInt(props.usdcBalance/props.crowdsaleStatus.priceOfTOAs)
        if(TOAsLeft()<canBuy) return TOAsLeft()
        return canBuy
    }

    const formatUSDC = (usdc) => {
        usdc = (usdc/1e6).toString()
        let ar = usdc.split('.')
        if(ar.length>1) ar[1] = ar[1].substring(0,2)
        return ar.join('.')
    }

    const back = () => {
        if(progressStage===0){
            setNumTOAs(0)
            cloneAddress()
            props.back()
        } else {
            setProgressStage(progressStage-1)
        }
    }

    const next = () => {
        if(progressStage===1)props.updateAddress(address)
        setProgressStage(progressStage+1)
    }

    const setAddressField = (field, val) => {
        let _address = Object.assign({},address)
        _address[field] = val
        setAddress(_address)
    }

    const buyTOAs = async () => {
        setShowStatus(true)
        try{
            const provider = props.library.getSigner(props.account)
            await setAllowance(provider,props.account,toBN(props.crowdsaleStatus.priceOfTOAs*numTOAs))
            setCurrent(1)
            let num = toBN(numTOAs)
            console.log(num)
            await buyTOAs_(provider,num)
            props.updateCrowdsaleStatus().then()
            await props.loadUSDC()
            setCurrent(2)
            setTimeout(()=>setShowStatus(false),1000)
            props.setTokensChanged(true)
            props.setPage('wallet')
            console.log('done')
        } catch (e){
            setError('Oops - Something went wrong :(')
            setTimeout(()=>setShowStatus(false),1500)
        }
        
    }

    return (
        <>
        <div className="mt-20">
            
            {(props.crowdsaleStatus && !props.crowdsaleStatus.minSold && props.crowdsaleStatus.timeLeft===0) && 
                <div className="text-center mt-16">The crowdsale has finished. You can no longer buy TOAs</div>
            }
            {(props.crowdsaleStatus && props.crowdsaleStatus.maxTOAs===props.crowdsaleStatus.numSold) && 
                <div className="text-center mt-16">The crowdsale is sold out. You can no longer buy TOAs</div>
            }
            {(!(props.crowdsaleStatus && !props.crowdsaleStatus.minSold && props.crowdsaleStatus.timeLeft===0)&&!(props.crowdsaleStatus && props.crowdsaleStatus.maxTOAs===props.crowdsaleStatus.numSold)) && 
            <>
            {progressStage===0 && (
                
                <div class="w-full text-center max-w-lg bg-white opacity-90 border-bordergold border shadow rounded-lg p-5 mx-auto relative mt-5">
                    
                     <h2 class="text-lg font-semibold text-gray-900 mb-2 font-kallisto-bold">Buy TOAs</h2>
                    <div className="mb-3 font-normal">TOAs available: {TOAsLeft()}</div>
                    <label for="number-input" class="block mb-2 text-xs font-normal text-gray-900">Select number of TOAs to buy:</label>
                    <input onChange={(e)=>setNumTOAs(parseInt(e.target.value))} type="number" min="1" max={allowedNum()} id="number-input" aria-describedby="Number of TOAs" class={`mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 `} placeholder="TOAs" required />
                {numTOAs>0 && 
                    <>
                    <div className="mt-3 font-normal text-xs">
                        Total: {formatUSDC(props.crowdsaleStatus.priceOfTOAs*numTOAs)} USDC <div className="inline-block text-xs text-italic text-slate-500">({numTOAs} x {formatUSDC(props.crowdsaleStatus.priceOfTOAs)} USDC)</div>
                    </div>
                    <div className="mt-2  text-xs">
                        Balance: {formatUSDC(props.usdcBalance - props.crowdsaleStatus.priceOfTOAs*numTOAs)} USDC 
                    </div>
                    <div className="max-w-sm mx-auto mt-5 text-center"><Button onClick={next} disabled={!numAllowed(numTOAs)}>Next <NextIcon/></Button></div>
                    </>
                }
                </div>
                
            )}

            {progressStage===1 && (
                <div className="w-full text-center max-w-lg bg-white  opacity-90 border-bordergold border shadow rounded-lg p-5 mx-auto mt-5  font-kallisto-bold">
                    <button onClick={back} className="absolute top-2 left-2"><BackIcon/> Back</button>
                    <h2 class="text-lg font-semibold text-gray-900 mb-2">{props.address?'Update Address':'Set Address'}</h2>
                    <input onChange={(e)=>setAddressField('fullName',e.target.value)} type="text" id="fullName" aria-describedby="Full name" className={`font-normal mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 `} placeholder="Full Name" value={address.fullName}/>
                    <input onChange={(e)=>setAddressField('streetAddressLine1',e.target.value)} type="text" id="streetAddressLine1" aria-describedby="Street Address Line1" className={`font-normal mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Street Address Line1" value={address.streetAddressLine1}/>
                    <input onChange={(e)=>setAddressField('streetAddressLine2',e.target.value)} type="text" id="streetAddressLine2" aria-describedby="Street Address Line2" className={`font-normal mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Street Address Line2" value={address.streetAddressLine2}/>
                    <input onChange={(e)=>setAddressField('city',e.target.value)} type="text" id="city" aria-describedby="City" className={`font-normal mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="City" value={address.city}/>
                    <input onChange={(e)=>setAddressField('state_province_region',e.target.value)} type="text" id="state_province_region" aria-describedby="State/Province/Region" className={`font-normal mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="State/Province/Region" value={address.state_province_region}/>
                    <input onChange={(e)=>setAddressField('country',e.target.value)} type="text" id="country" aria-describedby="Country" className={`font-normal mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Country" value={address.country}/>
                    <input onChange={(e)=>setAddressField('postal-zip',e.target.value)} type="text" id="postal_zip" aria-describedby="Postal Code/Zip Code" className={`font-normal mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Postal Code/Zip Code" value={address.postal_zip}/>
                    <input onChange={(e)=>setAddressField('mobile',e.target.value)} type="text" id="mobile" aria-describedby="Mobile" className={`font-normal mx-auto bg-gray-50 border border-gray-300 ${numAllowed(numTOAs)?'text-gray-900':'text-red-900'} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Mobile" />
                    <div className="max-w-sm mx-auto mt-5 text-center"><Button onClick={next}>Next</Button></div>
                </div>
                
            )}

            {progressStage===2 && (
                <div class="w-full text-center max-w-lg bg-white opacity-90 border-bordergold border shadow rounded-lg p-5 mx-auto mt-5  font-kallisto-bold">
                    <button onClick={back} className="absolute top-2 left-2"><BackIcon/> Back</button>
                    <h2 class="text-lg font-semibold text-gray-900 mb-2">Purchase TOA</h2>
                    <p className="font-normal text-sm m-3">You are about to purchase {numTOAs} TOA{numTOAs>1?'s':''} for {formatUSDC(props.crowdsaleStatus.priceOfTOAs*numTOAs)} USDC</p>
                    <div className="max-w-sm mx-auto mt-6 text-center"><Button onClick={buyTOAs}>Buy Now</Button></div>
                </div>
            )}
            </>
        }

        </div>
        {showStatus && <Status stages={['Approve USDC spend','Buy TOA' + (numTOAs>1?'s':'')]} current={current} error={error}/>}
        </>
    )
}

export default BuyTOAs