import React from 'react'
import HomeHero from '@/features/home/homeHero'
import HeroContent from '@/features/home/hero-content'
import HomeMainarea from '@/features/home/home-mainarea'
const page = () => {
  return (
    <div>
      <HomeHero/>
      <HeroContent/>
     <div className='absolute top-70 w-full'>
     <HomeMainarea/>
     </div>
    </div>
  )
}

export default page