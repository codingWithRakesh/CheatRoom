import React from 'react'
import { useState } from 'react';
import { MdDone } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';

const SidebarChat = () => {
    const [isCopied, setIsCopied] = useState(false);
    const [roomCode, setRoomCode] = useState('375835');
    const handleCopy = () => {
        navigator.clipboard.writeText(roomCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    return (
        <div className="messageDetails h-full bg-gray-800 w-[30%] border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="imageDiv h-[12rem] w-[12rem] overflow-hidden rounded-full mb-4">
                <img className='h-full w-full object-cover' src="https://picsum.photos/800/600" alt="" />
            </div>
            <div className="showCode flex items-center gap-3 mt-2 w-full max-w-xs">
                <div className='text-lg text-white font-mono font-bold bg-gray-700/50 p-3 rounded-lg flex-1 text-center border border-gray-600 tracking-wider'>
                    {roomCode}
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
    )
}

export default SidebarChat