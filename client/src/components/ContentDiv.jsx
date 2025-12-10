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

    const [isCopied, setIsCopied] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [localRoomCode, setLocalRoomCode] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    useEffect(() => {
        if (currentRoomCode) {
            setLocalRoomCode(currentRoomCode);
        }
    }, [currentRoomCode]);

    // useEffect(() => {
    //     if (error) {
    //         alert(error);
    //         clearError();
    //     }
    // }, [error]);

    const handleGenerateNewRoom = async () => {
        try {
            setLocalLoading(true);
            const code = await generateRoomCode(visitorId);
            setLocalRoomCode(code);
            setIsCopied(false);
        } catch (err) {
            console.error("Failed to generate room:", err);
        } finally {
            setLocalLoading(false);
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
            setLocalLoading(true);
            const success = await joinRoom(joinCodeInput.trim(), visitorId);
            if (success) {
                // console.log('Successfully joined room:', joinCodeInput);
                navigate(`/${joinCodeInput}`);
            }
        } catch (err) {
            console.error("Failed to join room:", err);
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className='h-82 w-full md:w-xl bg-zinc-900 rounded flex flex-col items-center justify-center text-white p-4 lg:p-8 space-y-4 lg:space-y-8 relative overflow-hidden'>

            <div className='flex items-center justify-center text-2xl lg:text-4xl p-3 lg:p-5 rounded-full bg-zinc-800 shadow-lg'>
                <FaShieldVirus className="text-white" />
            </div>

            {alignment === 'right' ? (
                <>
                    {localLoading && (
                        <div className="absolute h-full w-full inset-0 bg-black/50 flex items-center justify-center z-10">
                            <div className="relative flex items-center justify-center">
                                <div className="h-10 w-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                            </div>
                        </div>
                    )}

                    <h1 className='text-5xl sujoy1 lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center'>
                        Join Room
                    </h1>
                    <div className="w-full max-w-md mt-6">
                        <div className={`relative flex items-center transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500/30' : ''} bg-black rounded-xl p-1 border border-gray-600`}>
                            <input
                                type="text"
                                value={joinCodeInput}
                                onChange={(e) => setJoinCodeInput(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Enter room code"
                                className="w-3xl bg-transparent border-none outline-none px-3 lg:px-4 py-2 lg:py-2 sujoy2 text-base lg:text-lg font-mono placeholder-gray-400"
                                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                                disabled={localLoading}
                            />
                            <button
                                onClick={handleJoin}
                                disabled={!joinCodeInput.trim() || localLoading}
                                className={`flex items-center cursor-pointer justify-center p-2 lg:py-3 lg:px-6 rounded-lg transition-all duration-200 ${joinCodeInput.trim() && !localLoading ? 'bg-gradient-to-r from-blue-700 to-purple-800 hover:from-pink-800 hover:to-blue-900' : 'bg-green-800/30 cursor-not-allowed'} text-white`}
                                aria-label="Join room"
                            >
                                <TbArrowRight className="text-lg lg:text-xl" />
                            </button>
                        </div>
                        <p className="text-gray-400 sujoy2 text-xs lg:text-sm mt-2 text-center">
                            Enter the room code provided by your host
                        </p>
                    </div>
                </>
            ) : (
                <>
                    {localLoading && (
                        <div className="absolute h-full w-full inset-0 bg-black/50 flex items-center justify-center z-10">
                            <div className="relative flex items-center justify-center">
                                <div className="h-10 w-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row p-1 justify-center gap-6 items-center">
                        <h1 className='text-5xl lg:text-4xl sujoy1 font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center'>
                            Generate New Room
                        </h1>
                        <div className="buttonDiv">
                            <button
                                onClick={handleGenerateNewRoom}
                                disabled={localLoading}
                                className='bg-gradient-to-r items-center text-center sujoy1 cursor-pointer from-blue-950 to-purple-950 hover:from-pink-900 hover:to-blue-700 text-white font-semibold py-2 lg:py-2 px-4 lg:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-2xl lg:text-2xl'
                            >
                                {localLoading ? 'Generating...' : 'New Room'}
                            </button>
                        </div>
                    </div>
                    {localRoomCode && (
                        <div className="showCode p-1 items-center justify-center flex gap-2 lg:gap-3 w-full max-w-md">
                            <div className='text-base sujoy1 flex justify-center items-center lg:text-3xl font-mono font-bold bg-black p-2 lg:py-1 lg:px-2 rounded flex-1 text-center border border-gray-600 tracking-wider'>
                                {localRoomCode}
                            </div>
                            <button
                                onClick={handleCopy}
                                disabled={localLoading}
                                className='relative group sujoy1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-800/30 text-gray-300 transition-all duration-300 ease-in-out hover:bg-green-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                aria-label={isCopied ? "Copied!" : "Copy code"}
                            >
                                {isCopied ? (
                                    <>
                                        <MdDone className="text-green-400 text-2xl" />
                                        <span className="text-2xl text-gray-300">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <TbCopy className="text-2xl" />
                                        <span className="text-2xl text-gray-300">Copy</span>
                                    </>
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