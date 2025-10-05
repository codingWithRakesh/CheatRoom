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
        navigate('/');
    };
    
    return (
        <div className="hidden lg:flex h-full w-[20%] border-r border-gray-700 px-8 py-12 flex-col items-center justify-between">
            <div className="flex flex-col items-center">
                {/* Profile Section */}
                <div className="relative mb-8">
                    <div className="h-[10rem] w-[10rem] overflow-hidden rounded-full border-4 border-green-900 shadow-lg">
                        <img 
                            className='h-full w-full object-cover' 
                            src="https://picsum.photos/800/600" 
                            alt="Profile" 
                        />
                    </div>
                </div>

                {/* Room Code Section */}
                <div className="text-center mb-4">
                    <h3 className="text-2xl font-medium text-gray-200 sujoy1">
                        ROOM CODE
                    </h3>
                    <div className="showCode flex p-1 justify-center items-center gap-2 mt-4">
                        <div className='text-xl sujoy1 text-white font-mono font-semibold px-6 py-2 rounded-lg flex-1 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 tracking-wider bg-transparent'>
                            {code}
                        </div>
                        <button
                            onClick={handleCopy}
                            className='cursor-pointer sujoy1 hover:scale-110 bg-green-800/50 text-white p-3 rounded-lg border-2 border-gray-700 duration-200  flex items-center justify-center'
                            aria-label={isCopied ? "Copied!" : "Copy code"}
                        >
                            {isCopied ? (
                                <MdDone className="text-green-500 text-xl" />
                            ) : (
                                <TbCopy className="text-xl" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Room Info */}
                <div className="text-center">
                    <p className="text-md sujoy2 text-gray-500 dark:text-gray-400">
                        Share this code with others to join the chat
                    </p>
                </div>
            </div>
            
            {/* Exit Button */}
            <div className="exitButton w-full max-w-xs">
                <button
                    onClick={handleExit}
                    className="w-full cursor-pointer flex items-center justify-center gap-3 text-gray-300 hover:text-red-500 font-semibold py-3 px-4 rounded-lg hover:bg-red-700/10 border-2 border-gray-600 hover:border-red-600 transition-all duration-200 group"
                >
                    <MdExitToApp className="text-xl group-hover:scale-110 transition-transform" />
                    Exit Chat
                </button>
            </div>
        </div>
    )
}

export default SidebarChat