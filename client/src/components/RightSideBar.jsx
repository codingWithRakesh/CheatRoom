import React, { useRef } from 'react'
import { useState } from 'react';
import { FaLightbulb, FaShieldVirus } from 'react-icons/fa6';
import { RxCross1 } from "react-icons/rx";
import { TbArrowRight } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import { useRightSidebar } from '../contexts/rightSIdebarContext';
import roomStore from '../store/roomStore';
import fingerprintStore from '../store/fingerprintStore';
import { useEffect } from 'react';
import feedbackImg from "../assets/images/feedback.png"
import { AiFillBug } from "react-icons/ai";
import { useFeedback } from '../contexts/feedbackContent';
import { GoArrowLeft } from "react-icons/go";
import { FiArrowLeft, FiUploadCloud } from 'react-icons/fi';
import { HiArrowLeft } from "react-icons/hi2";
import { AiOutlineUpload, AiOutlineClose } from "react-icons/ai";
import FeedbackDIv from './FeedbackDIv';
import LoginByGoogle from './LoginByGoogle';


const RightSideBar = () => {
    const { isOpen, setIsOpen } = useRightSidebar();
    const navigate = useNavigate();

    const { deleteRoom, isLoading, error, clearError, clearMessage, message } = roomStore();
    const { visitorId } = fingerprintStore();

    const { isActive, setIsActive } = useFeedback();

    const [isCopied, setIsCopied] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [localRoomCode, setLocalRoomCode] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const handleJoin = async () => {
        if (joinCodeInput.trim() === '' || !visitorId) return;

        try {
            setLocalLoading(true);
            const success = await deleteRoom(joinCodeInput.trim(), visitorId);
            if (success) {
                setJoinCodeInput('');
                navigate(`/`);
            }
        } catch (err) {
            console.error("Failed to delete room:", err);
        } finally {
            setLocalLoading(false);
        }
    };

    useEffect(() => {
        if (!error && !message) return;
        const t = setTimeout(() => {
            clearError();
            clearMessage();
        }, 5000);
        return () => clearTimeout(t);
    }, [error, message, clearError, clearMessage]);


    return (
        <div className={`w-[25rem] h-screen ${isOpen.isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 flex items-center justify-center fixed top-0 right-0 bg-zinc-900 border border-gray-700 z-[9999] rounded-l-lg shadow-lg`}>
            <div className='w-full h-full'>
                <nav className='px-4 py-2.5 border-gray-700 border-b flex items-center justify-between'>
                    {isActive.isActive && <button onClick={() => {
                        setIsOpen(v => ({ ...v, isOpen: true, isWhat: "feedback" }))
                        setIsActive(v => ({ ...v, isActive: false, isWhat: "" }))
                        // setJoinCodeInput('');
                        // clearError();
                        // clearMessage();
                    }} className='text-white cursor-pointer p-3.5 rounded-full hover:bg-gray-800 transition-all duration-300 ease-in-out'>
                        <HiArrowLeft />
                    </button>}
                    <h1 className='text-white font-bold  sujoy1 text-3xl '>{isOpen.isWhat === "settings" ? "Delete Room" : "Send feedback"}</h1>
                    <button onClick={() => {
                        setIsOpen(v => ({ ...v, isOpen: !v.isOpen }))
                        setIsActive(v => ({ ...v, isActive: false, isWhat: "" }))
                        setJoinCodeInput('');
                        clearError();
                        clearMessage();
                    }} className='text-white cursor-pointer p-3.5 rounded-full hover:bg-gray-800 transition-all duration-300 ease-in-out'>
                        <RxCross1 />
                    </button>
                </nav>

                {isOpen.isWhat === "settings" && <div className='bodySIdebar flex flex-col items-center justify-start px-6 gap-6'>
                    <div className='peragraphShow'>
                        <p className="text-gray-300 sujoy2 text-center w-full lg:w-2/3 mx-auto mt-6">
                            If you create a temporary room, you can delete the room after your chat session is over.
                        </p>
                    </div>
                    <div className='flex items-center justify-center text-2xl lg:text-4xl p-3 lg:p-5 rounded-full bg-zinc-800 shadow-lg'>
                        <FaShieldVirus className="text-white" />
                    </div>
                    <h1 className='text-5xl sujoy1 lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center'>
                        Delete Room
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
                                className="w-3xl bg-transparent border-none outline-none px-3 lg:px-4 py-2 lg:py-2 sujoy2 text-base lg:text-lg font-mono placeholder-gray-400 text-white"
                                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                                disabled={localLoading}
                            />
                            <button
                                onClick={handleJoin}
                                disabled={!joinCodeInput.trim() || localLoading}
                                className={`flex items-center cursor-pointer justify-center p-2 lg:py-3 lg:px-6 rounded-lg transition-all duration-200 ${joinCodeInput.trim() && !localLoading ? 'bg-gradient-to-r from-blue-700 to-purple-800 hover:from-pink-800 hover:to-blue-900' : 'bg-green-800/30 cursor-not-allowed'} text-white`}
                                aria-label="Join room"
                            >
                                <MdDelete className="text-lg lg:text-xl" />
                            </button>
                        </div>
                        <p className="text-gray-400 sujoy2 text-xs lg:text-sm mt-2 text-center">
                            Enter your room code
                        </p>
                    </div>
                    {error && <div className='peragraphShow'>
                        <p className="text-red-300 sujoy2 text-center w-full lg:w-2/3 mx-auto mt-6">
                            {error}
                        </p>
                    </div>}
                    {message && <div className='peragraphShow'>
                        <p className="text-green-300 sujoy2 text-center w-full lg:w-2/3 mx-auto mt-6">
                            {message}
                        </p>
                    </div>}
                </div>}

                {isOpen.isWhat === "feedback" && <div className='bodySIdebar flex flex-col items-center justify-start px-6 gap-6'>
                    <div className="w-54 h-54 md:w-72 md:h-72 my-8 rounded-full overflow-hidden">
                        <img src={feedbackImg} alt="Feedback" className="h-full w-full object-contain" />
                    </div>
                    <button onClick={() => {
                        setIsOpen(v => ({ ...v, isOpen: true, isWhat: "" }))
                        setIsActive(v => ({ ...v, isActive: true, isWhat: "report" }))
                        localStorage.setItem("feedbackType", "report");
                    }} className='w-full h-[4rem] gap-3 cursor-pointer text-white bg-gradient-to-r flex items-center sujoy1 from-blue-950 to-purple-950 hover:from-pink-900 hover:to-blue-700 font-semibold py-2 lg:py-2 px-4 lg:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-2xl lg:text-2xl'>
                        <AiFillBug />
                        <p>Report a Bug</p>
                    </button>
                    <button onClick={() => {
                        setIsOpen(v => ({ ...v, isOpen: true, isWhat: "" }))
                        setIsActive(v => ({ ...v, isActive: true, isWhat: "ideas" }))
                        localStorage.setItem("feedbackType", "ideas");
                    }} className='w-full h-[4rem] gap-3 cursor-pointer bg-gradient-to-r flex items-center sujoy1 from-blue-950 to-purple-950 hover:from-pink-900 hover:to-blue-700 text-white font-semibold py-2 lg:py-2 px-4 lg:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-2xl lg:text-2xl'>
                        <FaLightbulb />
                        <p>Suggest a Feature</p>
                    </button>
                    <div className='peragraphShow'>
                        <p className="text-gray-300 sujoy2 text-center w-full lg:w-2/3 mx-auto mt-6">
                            If you report an issue or share a suggestion, our team will review it promptly and take necessary action at the earliest.
                        </p>
                    </div>
                </div>}

                {(isActive.isWhat === "ideas" && isActive.isActive) && <FeedbackDIv type="ideas" />}

                {(isActive.isWhat === "report" && isActive.isActive) && <FeedbackDIv type="report" />}

                {(isActive.isWhat === "login" && isActive.isActive) && <LoginByGoogle />}

            </div>
        </div>
    )
}

export default RightSideBar