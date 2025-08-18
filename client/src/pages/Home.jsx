import React from 'react'
import ContentDiv from '../components/contentDiv'

const Home = () => {
  return (
    <div className='bg-transparent w-[85%] fixed left-1/2 -translate-x-1/2 bottom-[1.5rem] h-[85%] flex items-center justify-center gap-8'>
        <ContentDiv alignment='left' />
        <ContentDiv alignment='right' />
    </div>
  )
}

export default Home