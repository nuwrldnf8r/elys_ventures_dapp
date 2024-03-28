
import Button from '../components/button'
import Status from '../components/status'
import {useState} from 'react'
import {assignTOAs, withdrawUSDC} from '../lib/crowdsale'

/*
<div className="text-right"><button onClick={async ()=>{
                    //console.log(props.address, props.tokenId.toNumber())
                    
                    const added = await window.ethereum.request({
                        method: 'wallet_watchAsset',
                        params: {
                          type: 'ERC721', // Initially only supports ERC20, but eventually more!
                          options: {
                            address: props.address, // The address that the token is at.
                            tokenId: props.tokenId.toString()
                          },
                        },
                    })
                    
                    console.log(added)
                    
                }}>Add to Metamask</button></div>
*/
const TokenCard = (props) => {
    return (
        <div href="#" class="m-3 inline-block overflow-hidden smax-w-sm w-60 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <img src={props.metadata.image} alt={'token'} />
            <div className="p-3 text-sm">
                <p className="font-medium text-gray-700">{props.metadata.description}</p>
                <p className="font-medium text-gray-700">Token ID: <span className="font-normal">{props.tokenId.toNumber()}</span></p>
                
            </div>
            
        </div>
    )
}

const Dashboard = (props) => {
    const [showStatus, setShowStatus] = useState(false)
    const [current, setCurrent] = useState(0)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState('All')

    console.log(props)
    let ar = []
    let arTokens = []


    if(!props.loadingTokens){
        if(filter==='All') ar = ar.concat(props.tokens.crowdsaleTokens,props.tokens.toas,props.tokens.ogTOAs)
        if(filter==='crowdsaleTokens') ar = props.tokens.crowdsaleTokens
        if(filter==='toas') ar = props.tokens.toas
        if(filter==='ogTOAs') ar = props.tokens.ogTOAs
        
        arTokens = ar.map(token=><TokenCard key={token.metadata.name + ' ' + token.tokenId} {...token} crowdsaleStatus={props.crowdsaleStatus} onClick={t=>{
            //console.log(t)
        }}/>)
    }

    const redeemTOAs = async () => {
        setShowStatus(true)
        try{
            const provider = props.library.getSigner(props.account)
            await assignTOAs(provider)
            props.setTokensChanged(true)
            setCurrent(2)
            setTimeout(()=>setShowStatus(false),1000)
        } catch(e) {
            setError('Oops - Something went wrong :(')
            setTimeout(()=>setShowStatus(false),1500)
        }

    }

    const formatUSDC = (usdc) => {
        usdc = (usdc/1e6).toString()
        let ar = usdc.split('.')
        if(ar.length>1) ar[1] = ar[1].substring(0,2)
        return ar.join('.')
    }

    const redeemUSDC = async () => {
        setShowStatus(true)
        try{
            const provider = props.library.getSigner(props.account)
            await withdrawUSDC(provider)
            props.setTokensChanged(true)
            props.loadUSDC()
            setCurrent(2)
            setTimeout(()=>setShowStatus(false),1000)
        } catch(e) {
            setError('Oops - Something went wrong :(')
            setTimeout(()=>setShowStatus(false),1500)
        }
    }

    const hasCrowdsaleTokens = () => props.tokens && props.tokens.crowdsaleTokens && props.tokens.crowdsaleTokens.length>0
    const hasTOAs = () => props.tokens && props.tokens.toas && props.tokens.toas.length>0
    const hasOGTOAs = () => props.tokens && props.tokens.ogTOAs && props.tokens.ogTOAs.length>0
    const multipleTokens = () => {
        let numTOATypes = 0
        if(hasCrowdsaleTokens()) numTOATypes++
        if(hasTOAs()) numTOATypes++
        if(hasOGTOAs()) numTOATypes++
        return numTOATypes>1
    }

    
    return (
        <div className="relative w-full p-6">
        <div className="mt-10 font-kallisto-medium text-center mb-5">
            USDC Balance: {formatUSDC(props.usdcBalance)}
        </div>
        <div>
            {(props.crowdsaleStatus && props.crowdsaleStatus.minSold && hasCrowdsaleTokens()) && (
                <div className="text-center"><Button onClick={redeemTOAs}>Crowdsale succesful - Redeem TOAs</Button></div>
            )}
            {(props.crowdsaleStatus && !props.crowdsaleStatus.minSold && props.crowdsaleStatus.timeLeft===0 && hasCrowdsaleTokens()) && (
                <div className="text-center"><Button onClick={redeemUSDC}>Crowdsale unsuccesful - Redeem USDC</Button></div>
            )}
        </div>
        

        <div className="relative h-10 mt-3 ml-3 font-kallisto-medium text-sm">
            
            {multipleTokens() && 
                
                    <div className="w-60 absolute right-10 top-0">
                        <label className="inline-block mr-2 mb-2 text-sm font-medium text-gray-900">Filter</label>
                        <select id="filter" class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 inline-block p-2.5" onChange={e=>{
                            e.stopPropagation()
                            setFilter(e.target.value)
                        }}>
                            <option selected>All</option>
                            {hasCrowdsaleTokens() && 
                                <option value="crowdsaleTokens">Crowdsale Tokens</option>
                            }
                            {hasTOAs() && 
                                <option value="toas">TOAs</option>
                            }
                            {hasOGTOAs() && 
                                <option value="ogTOAs">OG TOAs</option>
                            }
                            
                        </select>
                    </div>
                
            }
        </div>
        
       
        {props.loadingTokens && (
            <div role="status" className="w-10 h-10 mx-auto mt-52">
                <svg aria-hidden="true" className="w-10 h-10 text-white animate-spin fill-elysgreen" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span class="sr-only">Loading...</span>
            </div>
        )}
        
        {!props.loadingTokens && (
            <div className="text-center">
                {arTokens}
                {arTokens.length===0 && 
                    <div className="text-center">
                        <div className="mt-20 mb-3">You have no tokens</div>
                        {props.crowdsaleStatus && (props.crowdsaleStatus.minSold && props.crowdsaleStatus.timeLeft>0) &&
                            <Button onClick={()=>{props.setPage('buytoas')}}>Buy TOAs</Button>
                        }
                        
                    </div>
                }
            </div>
        )}
        {showStatus && <Status stages={[props.crowdsaleStatus.minSold?'Assigning TOAs':'Redeeming USDC']} current={current} error={error}/>}
        </div>
    )
}

export default Dashboard