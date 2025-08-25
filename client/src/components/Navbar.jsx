import React, { useState } from 'react'
import { FaShieldVirus, FaUserShield } from "react-icons/fa6";
import { MdDone, MdExitToApp } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import roomStore from "../store/roomStore.js"
import fingerprintStore from '../store/fingerprintStore.js';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const topClass = location.pathname === "/" ? "top-4" : "top-0";
  const widthClass = location.pathname === "/" ? "w-[95%]" : "w-[100%]";
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useParams();
  const { exitRoom } = roomStore();
  const { visitorId } = fingerprintStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExit = async () => {
    await exitRoom(code, visitorId);
    navigate('/'); // Navigate to home or another route
  };

  return (
    <div className={`h-16 ${widthClass} fixed ${topClass} rounded-2xl left-1/2 -translate-x-1/2 bg-gray-800 text-white flex items-center justify-between px-4 border border-gray-700 z-50`}>
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
            className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${isCopied
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

      {/* Right side - User icon and Exit button (on small screens) */}
      <div className='flex items-center gap-4'>
        {/* Exit button visible only at 1000px and below */}
        {code && (
          <button
            onClick={handleExit}
            className="max-[1000px]:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg border border-red-700 transition-colors duration-200 text-sm hidden"
          >
            <MdExitToApp className="text-lg" />
            <span className="hidden xs:inline">Exit</span>
          </button>
        )}
        <div className='flex items-center justify-center text-3xl cursor-pointer'>
          <FaUserShield />
        </div>
      </div>
    </div>
  )
}

export default Navbar