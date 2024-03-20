import Markdown from 'react-markdown'
const Crowdsales = (props) => {
    /*
    campaignLength
    : 
    259200
    maxTOAs
    : 
    10
    minSold
    : 
    true
    minTOAsSoldThreshold
    : 
    5
    numSold
    : 
    7
    priceOfTOAs
    : 
    1500000000
    timeLeft
    : 
    172800
    */

    const timeLeft = () => {
        if(!props.crowdsaleStatus.timeLeft) return 'loading..'
        let days = parseInt(props.crowdsaleStatus.timeLeft/60/60/24)
        if(days>0) return days + ' Days'
        let hours = parseInt(props.crowdsaleStatus.timeLeft/60/60)
        if(hours>0) return hours + ' Hours'
        let mins = parseInt(props.crowdsaleStatus.timeLeft/60)
        if(hours>0) return mins + ' Mins'
        return 'None'
    }
    return (
        <>
        <div class="w-full text-center max-w-xl bg-white opacity-90 border-bordergold border shadow rounded-lg p-4 mx-auto relative mt-20">
                    
            <h2 class="text-lg font-semibold text-gray-900 mb-2 font-kallisto-bold">[Current Crowdsale Name]</h2>
            <div class="w-full">
                <div className="w-2/3 p-2 inline-block font-normal text-xs text-left align-top"><Markdown>Info about the current crowdsale goes here</Markdown></div>
                <div className="w-1/3 p-2 inline-block font-normal text-xs align-top">
                    {(props.crowdsaleStatus.campaignLength) && <>
                        <div className="mb-2 text-left">Campaign Length: <span className="font-orbitron-bold text-slate-600">{parseInt(props.crowdsaleStatus.campaignLength/60/60/24)} Days</span></div>
                        <div className="mb-2 text-left">Time Left: <span className="font-orbitron-bold text-slate-600">{timeLeft()}</span></div>
                        <div className=" text-left mb-1">Tokens Sold: <span className="font-orbitron-bold text-slate-600">{props.crowdsaleStatus.numSold} of {props.crowdsaleStatus.maxTOAs}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-elysgreen h-2.5 rounded-full" style={{width: (props.crowdsaleStatus.numSold/props.crowdsaleStatus.maxTOAs*100) + '%'}}></div>
                        </div>
                    </>}
                    {!(props.crowdsaleStatus.campaignLength) && <div className="w-1/3 p-2 inline-block font-normal text-xs">loading..</div>}
                </div>
            </div>
        </div>
        </>
    )
}

export default Crowdsales