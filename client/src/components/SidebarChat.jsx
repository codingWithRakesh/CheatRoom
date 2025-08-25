import React from 'react'
import { useState } from 'react';
import { MdDone, MdExitToApp } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import profile from "../assets/images/profile.jpeg"
import { useParams, useNavigate } from 'react-router-dom';
import roomStore from "../store/roomStore.js"
import fingerprintStore from '../store/fingerprintStore.js';

const SidebarChat = () => {
    const [isCopied, setIsCopied] = useState(false);
    const { code } = useParams();
    const navigate = useNavigate();
    const {exitRoom} = roomStore();
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
        <div className="hidden lg:flex h-full bg-gray-800 w-[25%] border border-gray-700 rounded-lg px-8 py-12 flex-col items-center justify-between">
            <div className="flex flex-col items-center">
                <div className="imageDiv h-[12rem] w-[12rem] overflow-hidden rounded-full mb-4">
                    {/* <img className='h-full w-full object-cover' src={profile} alt="" /> */}
                    <img className='h-full w-full object-cover' src="https://picsum.photos/800/600" alt="" />
                </div>
                <div className="showCode flex items-center gap-3 mt-2 w-full max-w-xs">
                    <div className='text-lg text-white font-mono font-bold bg-gray-700/50 p-3 rounded-lg flex-1 text-center border border-gray-600 tracking-wider'>
                        {code}
                    </div>
                    <button
                        onClick={handleCopy}
                        className='bg-gray-700/50 cursor-pointer hover:bg-gray-600/70 text-white p-3 rounded-lg border border-gray-600 transition-colors duration-200 flex items-center justify-center'
                        aria-label={isCopied ? "Copied!" : "Copy code"}
                    >
                        {isCopied ? (
                            <MdDone className="text-green-400 text-xl" />
                        ) : (
                            <TbCopy className="text-xl" />
                        )}
                    </button>
                </div>
            </div>
            
            <div className="exitButton w-full max-w-xs">
                <button
                    onClick={handleExit}
                    className="w-full cursor-pointer flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg border border-red-700 transition-colors duration-200"
                >
                    <MdExitToApp className="text-xl" />
                    Exit Chat
                </button>
            </div>
        </div>
    )
}

export default SidebarChat