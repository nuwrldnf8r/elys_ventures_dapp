import Markdown from 'react-markdown'
import Button from '../components/button'
import demo2 from '../images/demo2.png'
import demo1 from '../images/demo1.png'
const Card = (props) => {
    const img = (
        <div className="inline-block w-1/3 p-6 align-top"><img src={props.image} alt={props.alt} /></div>
    )

    const text = (
        <div className="inline-block w-2/3 p-6 text align-top">
            <div className="text-xl text-white font-kallisto-bold">{props.header.toUpperCase()}</div>
            <div className="text-sm text-white font-poppins-regular mt-5">{props.children}</div>
        </div>
    )

    return <div className="w-3/4 mb-8 max-w-3xl relative shadow mx-auto rounded-2xl bg-elysgreen opacity-85 border border-bordergold">
            <>
            {(props.imgleft)?(<>{img}{text}</>):(<>{text}{img}</>)}
            {props.button && (<div className={`mt-2 absolute bottom-2 ${props.imgleft?'right-2':'left-2'}`}>{props.button}</div>)}
            </>
    </div>

}

const Main = (props) => {
    return (
        
        <div className="w-full min-h-screen bg-gradient-to-b from-elysgreen to-elysgold pt-10">
            <Card imgleft image={demo2} alt="display" header="Intro - Information" button={<Button onClick={()=>console.log('clicked')}>Click here</Button>}>
                <p className="mb-2">Some text goes here</p><p>Some more text goes here</p></Card>
            <Card imgleft={false} image={demo1} alt="display" header="Intro - Information"  button={<Button onClick={()=>console.log('clicked')}>Click here</Button>}><Markdown>Some text goes here</Markdown></Card>
        </div>
    )
}

export default Main