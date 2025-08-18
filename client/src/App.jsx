import React, { Suspense } from 'react'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'

const App = () => {
  return (
    <div className='h-screen w-screen flex justify-center items-center bg-gray-900'>
      <Navbar />
      <Suspense>
        <Outlet />
      </Suspense>
    </div>
  )
}

export default App