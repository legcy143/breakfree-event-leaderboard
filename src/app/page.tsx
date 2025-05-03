"use client"
import { assets } from '@/assets/assets'
import { Button } from '@heroui/react'
import React from 'react'

let data = [
  {
    img: "https://gkh-images.s3.amazonaws.com/e9745442-c58f-41f5-8ab6-026b3d2ae123_Clip%20path%20group-9.png",
    name: 'IMF & IM',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/29eda4c0-502f-41ee-86fb-75a38f981d3b_Clip%20path%20group-8.png",
    name: 'WEST 1 BEST 1',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/44fc5e1a-6737-46f8-b325-b00fa0331666_Clip%20path%20group-7.png",
    name: 'EASTERN TIGER',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/6eb0a821-f927-4982-8aba-ab1773192a65_Clip%20path%20group-6.png",
    name: 'AGENCY PARTNER CHANNEL',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/658bbcac-55b5-44d4-b75d-07e9367db81b_Clip%20path%20group-5.png",
    name: 'AAROHAN',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/8600ec56-b4dd-4ee8-b6b2-0ab7cee89097_Clip%20path%20group-4.png",
    name: 'NORTHERN TIGER',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/178c1702-d257-4558-a7e8-8f96cee08717_Clip%20path%20group-3.png",
    name: 'SOUTH 2',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/3f6a5ed5-2585-4d45-b97d-05a3b2672b56_Clip%20path%20group-2.png",
    name: 'WEST 2',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/9b94ead2-59af-4103-a121-9f04759ae3a0_Clip%20path%20group-1.png",
    name: 'SOUTH 1',
    score: '00',
  },
  {
    img: "https://gkh-images.s3.amazonaws.com/39199ece-414f-4bea-9f06-d7f82c1bac75_Clip%20path%20group.png",
    name: 'NORTH 2',
    score: '00',
  }
]

export default function page() {
  return (
    <main
      className='h-[100dvh] max-h-screen overflow-x-hidden '
      style={{
        background: `url(${assets.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div className='h-16 px-5'>
        <img src={assets.logo} className='h-full w-fit object-contain mx-auto md:mx-0' />
      </div>
      <h1 className=' text-center  uppercase text-3xl lg:text-5xl font-bold text-brand mt-1 mb-16'>live scoreboard</h1>
      <section className='max-w-[70rem] mx-auto flex-1 h-[calc(80%-1rem)]  overflow-y-auto'>
        {
          data.map((item, index) => {
            return (
              <div key={index} className='flex justify-between items-center p-4 gap-5 lg:gap-10 border-b border-brand/20'>
                <span className='bg-brand shrink-0 size-[1.5rem] md:size-[2rem] grid place-items-center rounded-full text-white font-bold' >{index + 1}</span>
                <img src={item.img} className='h-[1.5rem] w-[30%] object-contain  md:h-[2rem] lg:h-[3rem] mr-auto' />
                <h2 className='text-[3vw] md:text-2xl  w-full text-center font-bold text-brand mr-auto truncate'>{item.name}</h2>
                <h2 className='text-[3vw] md:text-2xl  font-bold text-brand'>{item.score}</h2>
              </div>
            )
          })
        }
      </section>

    </main>
  )
}
