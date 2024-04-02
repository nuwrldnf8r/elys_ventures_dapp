import {useState, useEffect} from 'react'

const Dots = () => {
    const [dots, setDots] = useState('')

    useEffect(() => {
        const update = () => {
            let _dots = dots + '.'
            if(_dots.length>8) _dots = '.'
            setDots(_dots)
        }
        const intervalId = setTimeout(update, 200);
        return () => {
          clearTimeout(intervalId);
        }
      }, [dots])

    return <>{dots.substring(0,5)}</>
}
    
const P = (props) => (
    <p className="leading-relaxed text-gray-500 dark:text-gray-400 font-normal text-sm">
        - {props.children} {props.current && <Dots/>}
    </p>
)

const Status = (props) => {
    const ar = props.stages.map((stage,i)=>{
        console.log(props.current===i)
        return <P key={i} current={(props.current===i)}>{stage}</P>
    })

    if(props.current>props.stages.length-1){
        if(props.error){
            ar.push(<p key={props.stages.length} className="leading-relaxed text-red-500 font-normal text-sm">Something went wrong {':('}</p>)
        } else {
            ar.push(<p key={props.stages.length} className="leading-relaxed text-green-500 dark:text-green-400 font-normal text-sm">Success!</p>)
        }
    }
    return (
        <>
        <div className="min-h-screen w-full absolute left-0 top-0 opacity-60 bg-white "></div>
        <div id="default-modal" tabindex="-1" aria-hidden="true" className="mx-auto mt-56 absolute w-96 z-50 justify-center items-center md:inset-0 h-[calc(100%-1rem)]">
            <div class="relative p-4 w-full max-w-2xl max-h-full">
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 class="text-xl font-kallisto-bold text-gray-900 dark:text-white">
                            Transaction Status
                        </h3>
                        
                    </div>
                    <div class="p-4 md:p-5 space-y-4">
                        {ar}
                    </div>
                    
                </div>
            </div>
        </div>

        </>
    )
}

export default Status

