import React from 'react'
import HomeHero from '@/features/home/homeHero'
import HeroContent from '@/features/home/hero-content'
import HomeMainarea from '@/features/home/home-mainarea'
import HomeSecTwo from '@/features/home/home-sec-two'
const page = () => {
  return (
    <div>
      <HomeHero/>
      <HeroContent/>
     <div className='absolute top-70 w-full'>
     <HomeMainarea/>
     </div>
     <HomeSecTwo/>
    </div>
  )
}

export default page