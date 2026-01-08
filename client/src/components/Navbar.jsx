import React, { useState } from 'react'
import { FaShieldVirus, FaUserShield } from "react-icons/fa6";
import { MdDone, MdExitToApp } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import roomStore from "../store/roomStore.js"
import fingerprintStore from '../store/fingerprintStore.js';
import LiveClock from './LiveClock.jsx';
import { FiHelpCircle, FiMessageSquare, FiSettings } from 'react-icons/fi';
import { useRightSidebar } from '../contexts/rightSIdebarContext.jsx';
import feedbackStore from '../store/feedbackStore.js';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const topClass = location.pathname === "/" ? "top-0" : "top-0";
  const widthClass = location.pathname === "/" ? "w-[100%]" : "w-[100%]";
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useParams();
  const { exitRoom } = roomStore();
  const { visitorId } = fingerprintStore();
  const { isOpen, setIsOpen } = useRightSidebar();
  const { submitFeedback, runServer } = feedbackStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExit = async () => {
    await exitRoom(code, visitorId);
    navigate('/');
  };

  return (
    <div className={`h-16 ${widthClass} fixed ${topClass} left-1/2 -translate-x-1/2 bg-black text-white flex items-center justify-between px-4 border-b border-gray-700 z-50`}>
      <div className="flex items-center p-1 gap-4">
        <div className='flex items-center justify-center text-4xl'>
          <FaShieldVirus />
        </div>
        <h1 className={`${code ? 'hidden lg:flex' : 'block'} text-4xl font-bold sujoy1 text-center`}>CheatRoom</h1>
      </div>

      {code && (
        <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-800/80 py-1 px-3 rounded border border-zinc-600">
          <span className="text-md sujoy1 font-mono font-medium tracking-wide">Room: {code}</span>
          <button
            onClick={handleCopy}
            className={`p-2 rounded transition-all duration-200 flex items-center justify-center ${isCopied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-zinc-600/50 hover:bg-zinc-500/70 text-gray-300 hover:text-white'
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

      <div className='flex items-center gap-4'>
        <div className={`${code ? 'hidden lg:flex' : 'hidden md:flex'} items-center justify-center text-3xl`}>
          <LiveClock />
          <div className="flex items-center p-2 justify-center gap-4 text-white">
          </div>
        </div>
        <FiMessageSquare onClick={async () => {
          setIsOpen(v => ({ ...v, isOpen: !v.isOpen, isWhat: "feedback" }))
          await runServer();
        }} className="h-6 w-6 cursor-pointer hover:text-green-900 transition-colors" />
        <FiSettings onClick={async () => {
          setIsOpen(v => ({ ...v, isOpen: !v.isOpen, isWhat: "settings" }))
          await runServer();
        }} className="h-6 w-6 cursor-pointer hover:text-green-900 transition-colors" />
        {code && (
          <button
            onClick={handleExit}
            className="max-[1000px]:flex items-center gap-2 bg-red-600/50 hover:bg-red-700 text-white font-medium py-3 px-4 rounded border-2 border-red-700 transition-colors duration-200 text-sm hidden"
          >
            <MdExitToApp className="text-lg" />
            <span className="hidden xs:inline">Exit</span>
          </button>
        )}

      </div>
    </div>
  )
}

export default Navbar