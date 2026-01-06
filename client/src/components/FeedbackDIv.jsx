import React, { useEffect, useState } from 'react'
import DragDropImageUpload from './DragDropImageUpload'
import { AiFillBug } from 'react-icons/ai'
import { FaLightbulb } from 'react-icons/fa6'
import { FcGoogle } from "react-icons/fc";
import { useFeedback } from '../contexts/feedbackContent';
import { handleError, handleSuccess } from '../utils/toastUtils';
import feedbackStore from "../store/feedbackStore"
import { dataToFormData } from "../constants/constant.js"

const FeedbackDIv = ({ type }) => {
    const { isActive, setIsActive } = useFeedback();
    const { submitFeedback, error, isLoading, message, clearError, clearMessage } = feedbackStore();
    const [feedbackData, setFeedbackData] = useState({
        message: "",
        feedBackType: type === "report" ? "BUG" : "FEATURE",
        attachment: ""
    })
    const [resetImageKey, setResetImageKey] = useState(0);
    const submitFeedbackFun = async () => {
        if (feedbackData.message.trim() === "") {
            handleError("Please enter a message before submitting feedback.");
            return;
        }
        localStorage.setItem("feedbackData", JSON.stringify({
            message: feedbackData.message,
            feedBackType: feedbackData.feedBackType
        }));

        const formData = dataToFormData(feedbackData);

        try {
            await submitFeedback(formData);
            handleSuccess("Feedback submitted successfully!");
            localStorage.removeItem("feedbackData");
            setFeedbackData({
                message: "",
                feedBackType: type === "report" ? "BUG" : "FEATURE",
                attachment: ""
            });
            setResetImageKey(prev => prev + 1);
        } catch (err) {

            if (err.response?.status === 401) {
                setIsActive(v => ({ ...v, isActive: true, isWhat: "login" }));
                return;
            }

            handleError("Failed to submit feedback. Please try again later.");
        }
    }

    useEffect(() => {
        if (!error && !message) return;
        const t = setTimeout(() => {
            clearError();
            clearMessage();
        }, 5000);
        return () => clearTimeout(t);
    }, [error, message, clearError, clearMessage]);


    return (
        <div className='p-4 overflow-auto'>
            {type === "report" ? <div className="titleOfFeedback flex items-center sujoy1 gap-3 text-4xl font-bold pb-6 lg:text-4xl">
                <AiFillBug className="text-red-500" />
                <p className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Report a Bug
                </p>
            </div>
                :
                <div className="titleOfFeedback flex items-center sujoy1 gap-3 text-4xl font-bold pb-6 lg:text-4xl">
                    <FaLightbulb className="text-yellow-400" />
                    <p className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Suggest a Feature
                    </p>
                </div>}

            <div className='bodyOfFeedback'>
                <div className='relative flex items-center h-[15rem] transition-all duration-200  bg-black rounded-xl p-1 border border-gray-600'>
                    <textarea value={feedbackData.message} onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))} className='w-full h-full text-white border-none outline-none resize-none p-2 sujoy2' placeholder="Describe the issue you encountered..."></textarea>
                </div>

                <div className='takeImage mt-4'>
                    <DragDropImageUpload key={resetImageKey} onImageSelect={(image) => setFeedbackData(prev => ({ ...prev, attachment: image }))} />
                </div>


                <button disabled={isLoading} onClick={submitFeedbackFun} className='bg-gradient-to-r mt-4 w-full items-center text-center sujoy1 cursor-pointer from-blue-950 to-purple-950 hover:from-pink-900 hover:to-blue-700 text-white font-semibold py-2 lg:py-2 px-4 lg:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-2xl lg:text-2xl'>
                    {isLoading ? "Submitting..." : "Submit"}
                </button>

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

            </div>
        </div>
    )
}

export default FeedbackDIv