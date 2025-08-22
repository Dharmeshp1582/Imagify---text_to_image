import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='flex items-center justify-between gap-4 py-3 mt-20'>

    <img src={assets.logo} alt="" width={150} />
   <p className='flex-1 border-l border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden'>Copyright @Dharmesh.dev | 2025. All rights reserved</p>

   <div className='flex gap-2.5'>
  
   <a href="https://www.facebook.com/share/1Bh5j2g3EG/" target="_blank" rel="noopener noreferrer"> <img src={assets.facebook_icon} alt="" width={35}/></a>
  <a href="https://www.linkedin.com/in/dharmesh-patel-7a6244256/" target="_blank" rel="noopener noreferrer">  <img src={assets.linkdin_icon} alt="" width={35}/></a>
    <a href="https://x.com/Dharmes11235792?t=jSQov_B2h6LeNjtxlZK4qg&s=09" target="_blank" rel="noopener noreferrer"><img src={assets.twitter_icon} alt="" width={35}/></a>
    <a href="https://www.instagram.com/dharmesh_ptl_001?igsh=MWR6M2F4NDFhcm41bA==" target="_blank" rel="noopener noreferrer"><img src={assets.instagram_icon } alt="" width={35}/></a>
   </div>
    </div>
  )
}

export default Footer