import {mintUSDC, USDCBalance, addDay, toBN} from '../lib/crowdsale'
import Button from '../components/button'
import Status from '../components/status'
import {useState} from 'react'
import {BackIcon} from '../icons/icons'

const Test = (props) => {
    const [showStatus, setShowStatus] = useState(false)
    const [current, setCurrent] = useState(0)
    const [stages,setStages] = useState([])
    return (
        <>
        <div className="w-full text-center max-w-lg bg-white opacity-90 border-bordergold border shadow rounded-lg p-5 mx-auto mt-20">
            <div>USDC Balance: {props.usdcBalance.toNumber()/1e6}</div>
            {props.crowdsaleStatus.timeLeft && 
            <div>Days Left: {parseInt(props.crowdsaleStatus.timeLeft/60/60/24)}</div>
            }
            <div className="mt-3"></div>
            <Button onClick={()=>props.back()}><BackIcon/> Back</Button>
            <Button onClick={async () => {
                setCurrent(0)
                setStages(['Minting USDC'])
                setShowStatus(true)
                
                await mintUSDC(props.library.getSigner(props.account), props.account, toBN(1500,6))
                let bal = await USDCBalance(props.chainId,props.account)
                props.setUsdcBalance(bal)
                
               
                setCurrent(1)
                setTimeout(()=>setShowStatus(false),1000)
               
            }}>Mint USDC</Button>
            <Button onClick={async () => {
                setCurrent(0)
                setStages(['Adding a day'])
                setShowStatus(true)
                await addDay(props.library.getSigner(props.account))
                props.updateCrowdsaleStatus()
                setCurrent(1)
                setTimeout(()=>setShowStatus(false),1000)
               
            }}>Add Day</Button>

        </div>

        {showStatus && <Status stages={stages} current={current}/>}
        </>
    )
}

export default Test