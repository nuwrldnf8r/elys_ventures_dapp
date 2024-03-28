
import { InjectedConnector } from "@web3-react/injected-connector"
import {useWeb3React } from "@web3-react/core"
import networks from './lib/networks'
import {useState, useEffect, useCallback, useRef} from 'react'
import {saveAddress, getAddress} from './lib/address'
import Button from './components/button'
import BuyTOAs from './pages/buytoas'
import Dashboard from './pages/dashboard'
import Crowdsales from './pages/crowdsales'
import Main from './pages/main'
import Test from './pages/test'
import Help from './pages/help'
import About from './pages/about'
import UpdateAddress from './pages/update_address'
import {USDCBalance, getStatus, getTokens as loadTokens, toBN} from './lib/crowdsale'
import {User, Home} from './icons/icons'
import logo from './images/logo.png' 

const Injected = new InjectedConnector({
  supportedChainIDs: [networks.fuji.id, networks.avax.id]
})

const Header = (props) => {
  //<div className="mr-5 inline-block text-sm">{props.account.substring(0,8)+'...'+props.account.substring(props.account.length-8)}</div>
  return (
    <div className="w-full relative h-14 bg-elysgreen">
      <div className="absolute left-2 top-1" onClick={()=>props.setPage('main')}>
        <img src={logo} alt="Logo" width="45" height="45"/>
      </div>

      
            <div className="absolute top-4 left-32">
            <button className="text-white ml-10 font-kallisto-bold text-xs" onClick={()=>props.setPage('main')}><Home /> Home</button>
            <button className="text-white  ml-10 font-kallisto-bold text-xs" onClick={()=>props.setPage('crowdsales')}>Crowdsales</button>
            {props.active && 
            <>
              <button className="text-white  ml-10 font-kallisto-bold text-xs" onClick={()=>props.setPage('dashboard')}>Dashboard</button>
              <button className="text-white  ml-10 font-kallisto-bold text-xs" onClick={()=>props.setPage('buytoas')}>Buy TOAs</button>
              {props.chainId === 0xa869 && 
                <button className="text-white ml-10 font-kallisto-bold italic text-xs"  onClick={()=>props.setPage('test')}>Test</button>
              }
            </>}
            <button className="text-white  ml-10 font-kallisto-bold text-xs" onClick={()=>props.setPage('about')}>About</button>
            </div>
      
      
      <div className="absolute right-0 top-2">
        {props.active && 
          <div className="mr-5 inline-block text-white hover:text-gray-300 cursor-pointer" onMouseEnter={()=>props.userMenu(true)} onMouseLeave={()=>props.userMenu(false)}><User /></div>
          
        }
        <Button onClick={()=>{
        if(props.onConnect)props.onConnect(!props.active)
        if(!props.active){
          props.activate(Injected)
        } else {
          props.deactivate()
        }
        
      }}>{props.active?'Disconnect':'Connect'}</Button></div>
    </div>
  )
}

const MenuItem = (props) => {
  return <button className="mb-2 ml-1 block text-white text-sm text-center hover:text-gray-300" onClick={props.onClick}>{props.children}</button>
}

const Menu = (props) => {
  return (
    <div className="absolute right-32 top-neg-5 bg-elysgreen border-bordergold border p-2 shadow rounded-b-md w-44 z-50 text-center" onMouseEnter={()=>props.userMenu(true)} onMouseLeave={()=>props.userMenu(false)}>
        <div className=" text-white text-xs italic opacity-50 mb-3">{props.account.substring(0,7) + '......' + props.account.substring(props.account.length-7)}</div>
        <MenuItem onClick={()=>{
          props.userMenu(false)
          props.setPage('dashboard')
        }}>Dashboard</MenuItem>
        <MenuItem onClick={()=>{
          props.userMenu(false)
          props.setPage('updateaddress')
        }}>Update Address</MenuItem>
        <MenuItem onClick={()=>{
          props.userMenu(false)
          props.setPage('help')
        }}>Help</MenuItem>
    </div>
  )
}

function App() {
  const { activate, deactivate, active, account, library, chainId } = useWeb3React()
  const [connecting, setConnecting] = useState(false)
  const [page, setPage] = useState('main')
  const [address, setAddress] = useState(null)
  const [usdcBalance, setUsdcBalance] = useState(toBN(0))
  const [crowdsaleStatus, setCrowdsaleStatus] = useState({}) 
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  //const [loadingTokens, setLoadingTokens] = useState(false)
  const [tokensChanged, setTokensChanged] = useState(true)
  const [tokens, setTokens] = useState({})

  const onConnect = async (connecting) => setConnecting(connecting)
  let loadingTokens = useRef(false)
  let menuTimeout = useRef(null)
  console.log(page)

  const updateCrowdsaleStatus = useCallback(async ()=>{
    if(updatingStatus) return
    console.log('*********updating status')
    setUpdatingStatus(true)
    let status = await getStatus(chainId)
    console.log(status)
    setCrowdsaleStatus(status)
    console.log(status)
    setTimeout(()=>setUpdatingStatus(false),500)
  },[chainId, updatingStatus])
  
  

  const updateAddress = async (address) => {
    console.log('saving address')
    await saveAddress(account, address)
    setAddress(address)
    console.log('done')
  }

  const getTokens =  useCallback(async () => {
    if(loadingTokens.current) return
    loadingTokens.current = true
    console.log('loading tokens')
    let _tokens = await loadTokens(chainId, account)
    setTokens(_tokens)
    loadingTokens.current = false
  },[account, chainId, loadingTokens])
    
  useEffect(()=>{
    if(active && connecting){
      console.log('here',Date.now())
      getAddress(account).then(address=>{
        if(!address.error) {
          console.log(address)
          setAddress(address)
        }
      })
      USDCBalance(chainId, account).then(bal=>setUsdcBalance(bal))
      
      setConnecting(false)
    }
    if(page!=='main' && page!=='crowdsales' && !active){
      console.log(page)
      setPage('main')
    }
    
  },[active, connecting, page, account, crowdsaleStatus, chainId, updateCrowdsaleStatus, getTokens])

  useEffect(()=>{
    if(tokensChanged && active){
      setTokensChanged(false)
      getTokens().then(()=>{console.log(tokens)})
    }
  },[setPage,page,getTokens,loadingTokens,tokens, tokensChanged, active])

  useEffect(()=>{
    if(!crowdsaleStatus.campaignLength){
      updateCrowdsaleStatus().then(()=>{
        setInterval(async ()=> await updateCrowdsaleStatus(),60000)
      })
    } 
  },[crowdsaleStatus.campaignLength,updateCrowdsaleStatus])

  const loadUSDC = async () => {
     const bal = await USDCBalance(chainId, account)
     setUsdcBalance(bal)
  }

  const userMenu = (show) => {
    if(show){
      setShowUserMenu(true)
      clearTimeout(menuTimeout.current)
    } else {
      menuTimeout.current = setTimeout(()=>setShowUserMenu(false),500)
    }
  }

  return (
    <div className="App relative">
      <Header activate={activate} deactivate={deactivate} active={active} account={account} onConnect={onConnect} userMenu={userMenu} setPage={setPage} chainId={chainId}/>
      {showUserMenu && <Menu  userMenu={userMenu} account={account} setPage={setPage} />}
      <div className="w-full">
        

        {page==='buytoas' && <BuyTOAs account={account} library={library} address={address} chainId={chainId} setUsdcBalance={setUsdcBalance} usdcBalance={usdcBalance} updateCrowdsaleStatus={updateCrowdsaleStatus} crowdsaleStatus={crowdsaleStatus} updateAddress={updateAddress} back={()=>setPage('main')} setPage={setPage} setTokensChanged={setTokensChanged} loadUSDC={loadUSDC}/>}
        {page==='dashboard' && <Dashboard account={account} library={library} address={address} chainId={chainId} loadingTokens={loadingTokens.current} tokens={tokens} usdcBalance={usdcBalance} crowdsaleStatus={crowdsaleStatus} back={()=>setPage('main')} setPage={setPage} setTokensChanged={setTokensChanged} loadUSDC={loadUSDC}/>}
        {page==='updateaddress' && <UpdateAddress updateAddress={updateAddress} address={address} setPage={setPage}/>}
        {page==='crowdsales' && <Crowdsales crowdsaleStatus={crowdsaleStatus} updatingStatus={updatingStatus}/>}
        {page==='main' && (
          <Main />
        )}
        {page==='help' && <Help />}
        {page==='about' && <About />}
        {page==='test' && <Test account={account} library={library} address={address} chainId={chainId} setUsdcBalance={setUsdcBalance} usdcBalance={usdcBalance} updateCrowdsaleStatus={updateCrowdsaleStatus} crowdsaleStatus={crowdsaleStatus} back={()=>setPage('main')}  setTokensChanged={setTokensChanged}/>}
        
      </div>
    </div>
  );
}

export default App;
