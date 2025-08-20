import React from 'react'
import { FaShieldVirus, FaUserShield } from "react-icons/fa6";
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const topClass = location.pathname === "/" ? "top-4" : "top-0";

  return (
    <div className={`h-16 w-[100%] fixed ${topClass} rounded-2xl left-1/2 -translate-x-1/2 bg-gray-800 text-white flex items-center justify-between px-4 border border-gray-700`}>
      <h1 className='text-xl font-bold flex items-center gap-4'>
        <div className='flex items-center justify-center text-4xl '>
          <FaShieldVirus />
        </div>
        CheatRoom
      </h1>
      <div className='flex items-center justify-center text-3xl cursor-pointer gap-4'>
        <FaUserShield />
      </div>
    </div>
  )
}

export default Navbar
