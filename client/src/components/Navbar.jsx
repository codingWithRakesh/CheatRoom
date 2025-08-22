import React, { useState } from 'react'
import { FaShieldVirus, FaUserShield } from "react-icons/fa6";
import { MdDone } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import { useLocation, useParams } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const topClass = location.pathname === "/" ? "top-4" : "top-0";
  const widthClass = location.pathname === "/" ? "w-[95%]" : "w-[100%]";
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useParams();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`h-16 ${widthClass} fixed ${topClass} rounded-2xl left-1/2 -translate-x-1/2 bg-gray-800 text-white flex items-center justify-between px-4 border border-gray-700`}>
      {/* Left side - Logo */}
      <div className="flex items-center gap-4">
        <div className='flex items-center justify-center text-4xl'>
          <FaShieldVirus />
        </div>
        <h1 className='text-xl font-bold sm:block hidden'>CheatRoom</h1>
      </div>

      {/* Center - Code display (only on small screens) */}
      {code && (
        <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-700/80 py-1 px-3 rounded-lg border border-gray-600">
          <span className="text-sm font-mono font-medium tracking-wide">Room: {code}</span>
          <button
            onClick={handleCopy}
            className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
              isCopied 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-600/50 hover:bg-gray-500/70 text-gray-300 hover:text-white'
            }`}
            aria-label={isCopied ? "Copied!" : "Copy code"}
          >
            {isCopied ? (
              <MdDone className="text-lg" />
            ) : (
              <TbCopy className="text-lg" />
            )}
          </button>
        </div>
      )}

      {/* Right side - User icon */}
      <div className='flex items-center justify-center text-3xl cursor-pointer'>
        <FaUserShield />
      </div>
    </div>
  )
}

export default Navbar