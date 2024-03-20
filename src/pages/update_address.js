import {useState} from 'react'
import Button from '../components/button'

const UpdateAddress = (props) => {
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
    const setAddressField = (field, val) => {
        let _address = Object.assign({},address)
        _address[field] = val
        setAddress(_address)
    }

    return (
        <>
        <div class="w-full text-center max-w-lg bg-white border-gray-200 border shadow rounded-lg p-5 mx-auto mt-5">
            <h2 class="text-lg font-kallisto-bold text-gray-900 mb-2">{props.address?'Update Address':'Set Address'}</h2>
            <input onChange={(e)=>setAddressField('fullName',e.target.value)} type="text" id="fullName" aria-describedby="Full name" className={`font-normal mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 `} placeholder="Full Name" value={address.fullName}/>
            <input onChange={(e)=>setAddressField('streetAddressLine1',e.target.value)} type="text" id="streetAddressLine1" aria-describedby="Street Address Line1" className={`font-normal mx-auto bg-gray-50 border border-gray-30 text-gray-900} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Street Address Line1" value={address.streetAddressLine1}/>
            <input onChange={(e)=>setAddressField('streetAddressLine2',e.target.value)} type="text" id="streetAddressLine2" aria-describedby="Street Address Line2" className={`font-normal mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Street Address Line2" value={address.streetAddressLine2}/>
            <input onChange={(e)=>setAddressField('city',e.target.value)} type="text" id="city" aria-describedby="City" className={`font-normal mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="City" value={address.city}/>
            <input onChange={(e)=>setAddressField('state_province_region',e.target.value)} type="text" id="state_province_region" aria-describedby="State/Province/Region" className={`font-normal mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="State/Province/Region" value={address.state_province_region}/>
            <input onChange={(e)=>setAddressField('country',e.target.value)} type="text" id="country" aria-describedby="Country" className={`font-normal mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Country" value={address.country}/>
            <input onChange={(e)=>setAddressField('postal-zip',e.target.value)} type="text" id="postal_zip" aria-describedby="Postal Code/Zip Code" className={`font-normal mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Postal Code/Zip Code" value={address.postal_zip}/>
            <input onChange={(e)=>setAddressField('mobile',e.target.value)} type="text" id="mobile" aria-describedby="Mobile" className={`font-normal mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-2`} placeholder="Mobile" />
            <div className="max-w-sm mx-auto mt-5 text-center"><Button onClick={()=>{
                props.updateAddress(address)
                props.setPage('main')
            }}>Save</Button></div>
        </div>
        </>
    )
}

export default UpdateAddress
