import React, { useState } from 'react';
import { FaShieldVirus } from 'react-icons/fa6';
import { MdDone } from 'react-icons/md';
import { SiGotomeeting } from 'react-icons/si';
import { TbCopy, TbCopyCheck, TbArrowRight } from "react-icons/tb";

const ContentDiv = ({ alignment }) => {
    // Shared states
    const [isCopied, setIsCopied] = useState(false);
    const [roomCode, setRoomCode] = useState('375835');
    const [joinCode, setJoinCode] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Generate new room code (simple random example)
    const generateNewRoom = () => {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        setRoomCode(newCode);
        setIsCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(roomCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleJoin = () => {
        if (joinCode.trim() === '') return;
        console.log('Joining room:', joinCode);
        // Add your join room logic here
    };

    return (
        <div className='h-[90%] w-[45%] rounded-2xl bg-gray-800 border border-gray-700 flex flex-col items-center justify-center text-white p-8 space-y-8 relative overflow-hidden'>
            {/* Common decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            {/* Common icon */}
            <div className='flex items-center justify-center text-4xl p-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg'>
                <FaShieldVirus className="text-white" />
            </div>

            {/* Conditional rendering based on alignment */}
            {alignment === 'left' ? (
                <>
                    <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                        Generate New Room
                    </h1>
                    <div className="buttonDiv">
                        <button 
                            onClick={generateNewRoom}
                            className='bg-gradient-to-r cursor-pointer from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105'
                        >
                            New Room
                        </button>
                    </div>
                    <div className="showCode flex items-center gap-3 mt-2 w-full max-w-xs">
                        <div className='text-lg font-mono font-bold bg-gray-700/50 p-3 rounded-lg flex-1 text-center border border-gray-600 tracking-wider'>
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
                </>
            ) : (
                <>
                    <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                        Join Room
                    </h1>
                    <div className="w-full max-w-md">
                        <div className={`relative flex items-center transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500/30' : ''} bg-gray-700/50 rounded-xl p-1 border border-gray-600`}>
                            <input 
                                type="text" 
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Enter room code"
                                className="w-full bg-transparent border-none outline-none px-4 py-3 text-lg font-mono placeholder-gray-400"
                                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                            />
                            <button 
                                onClick={handleJoin}
                                disabled={!joinCode.trim()}
                                className={`flex items-center cursor-pointer justify-center p-3 rounded-lg transition-all duration-200 ${joinCode.trim() ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : 'bg-gray-600 cursor-not-allowed'} text-white`}
                                aria-label="Join room"
                            >
                                <TbArrowRight className="text-xl" />
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mt-2 text-center">
                            Enter the room code provided by your host
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContentDiv;