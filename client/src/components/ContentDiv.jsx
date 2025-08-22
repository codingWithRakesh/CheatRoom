import React, { useState, useEffect } from 'react';
import { FaShieldVirus } from 'react-icons/fa6';
import { MdDone } from 'react-icons/md';
import { TbCopy, TbArrowRight } from "react-icons/tb";
import roomStore from "../store/roomStore.js";
import fingerprintStore from "../store/fingerprintStore.js";
import { useNavigate } from 'react-router-dom';

const ContentDiv = ({ alignment }) => {
    const { generateRoomCode, currentRoomCode, joinRoom, isLoading, error, clearError } = roomStore();
    const { visitorId } = fingerprintStore();
    const navigate = useNavigate();

    // Shared states
    const [isCopied, setIsCopied] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [localRoomCode, setLocalRoomCode] = useState('');

    // Update local room code when store updates
    useEffect(() => {
        if (currentRoomCode) {
            setLocalRoomCode(currentRoomCode);
        }
    }, [currentRoomCode]);

    // Handle errors
    useEffect(() => {
        if (error) {
            alert(error);
            clearError();
        }
    }, [error]);

    // Generate new room code
    const handleGenerateNewRoom = async () => {
        try {
            const code = await generateRoomCode();
            setLocalRoomCode(code);
            setIsCopied(false);
        } catch (err) {
            console.error("Failed to generate room:", err);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(localRoomCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleJoin = async () => {
        if (joinCodeInput.trim() === '' || !visitorId) return;
        
        try {
            const success = await joinRoom(joinCodeInput.trim(), visitorId);
            if (success) {
                console.log('Successfully joined room:', joinCodeInput);
                navigate(`/${joinCodeInput}`);
            }
        } catch (err) {
            console.error("Failed to join room:", err);
        }
    };

    return (
        <div className='h-full lg:h-[90%] w-full lg:w-[45%] rounded-2xl bg-gray-800 border border-gray-700 flex flex-col items-center justify-center text-white p-4 lg:p-8 space-y-4 lg:space-y-8 relative overflow-hidden'>
            {/* Common decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            {/* Common icon */}
            <div className='flex items-center justify-center text-2xl lg:text-4xl p-3 lg:p-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg'>
                <FaShieldVirus className="text-white" />
            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 lg:h-12 w-8 lg:w-12 border-b-2 border-white"></div>
                </div>
            )}

            {/* SHOW JOIN SECTION FIRST */}
            {alignment === 'right' ? (
                <>
                    <h1 className='text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center'>
                        Join Room
                    </h1>
                    <div className="w-full max-w-md">
                        <div className={`relative flex items-center transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500/30' : ''} bg-gray-700/50 rounded-xl p-1 border border-gray-600`}>
                            <input 
                                type="text" 
                                value={joinCodeInput}
                                onChange={(e) => setJoinCodeInput(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Enter room code"
                                className="w-full bg-transparent border-none outline-none px-3 lg:px-4 py-2 lg:py-3 text-base lg:text-lg font-mono placeholder-gray-400"
                                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                                disabled={isLoading}
                            />
                            <button 
                                onClick={handleJoin}
                                disabled={!joinCodeInput.trim() || isLoading}
                                className={`flex items-center cursor-pointer justify-center p-2 lg:p-3 rounded-lg transition-all duration-200 ${joinCodeInput.trim() && !isLoading ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : 'bg-gray-600 cursor-not-allowed'} text-white`}
                                aria-label="Join room"
                            >
                                <TbArrowRight className="text-lg lg:text-xl" />
                            </button>
                        </div>
                        <p className="text-gray-400 text-xs lg:text-sm mt-2 text-center">
                            Enter the room code provided by your host
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <h1 className='text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center'>
                        Generate New Room
                    </h1>
                    <div className="buttonDiv">
                        <button 
                            onClick={handleGenerateNewRoom}
                            disabled={isLoading}
                            className='bg-gradient-to-r cursor-pointer from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 lg:py-3 px-4 lg:px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base'
                        >
                            {isLoading ? 'Generating...' : 'New Room'}
                        </button>
                    </div>
                    {localRoomCode && (
                        <div className="showCode flex items-center gap-2 lg:gap-3 mt-2 w-full max-w-xs">
                            <div className='text-base lg:text-lg font-mono font-bold bg-gray-700/50 p-2 lg:p-3 rounded-lg flex-1 text-center border border-gray-600 tracking-wider'>
                                {localRoomCode}
                            </div>
                            <button 
                                onClick={handleCopy}
                                disabled={isLoading}
                                className='bg-gray-700/50 cursor-pointer hover:bg-gray-600/70 text-white p-2 lg:p-3 rounded-lg border border-gray-600 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                                aria-label={isCopied ? "Copied!" : "Copy code"}
                            >
                                {isCopied ? (
                                    <MdDone className="text-green-400 text-lg lg:text-xl" />
                                ) : (
                                    <TbCopy className="text-lg lg:text-xl" />
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ContentDiv;