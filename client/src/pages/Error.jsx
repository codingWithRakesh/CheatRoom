import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BiErrorCircle } from 'react-icons/bi';
import { IoMdArrowRoundBack } from 'react-icons/io';

const Error = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 text-white">
            <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-2xl animate-fade-in">
                {/* Animated error icon */}
                <div className="flex justify-center mb-6">
                    <BiErrorCircle className="text-6xl text-red-500 animate-bounce" />
                </div>

                {/* 404 text with gradient */}
                <h1 className="text-8xl font-bold text-center mb-2 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                    404
                </h1>

                {/* Error message */}
                <h2 className="text-2xl font-semibold text-center mb-4">Page Not Found</h2>
                <p className="text-gray-400 text-center mb-8">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300"
                    >
                        <IoMdArrowRoundBack />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 cursor-pointer py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-lg"
                    >
                        Return Home
                    </button>
                </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-purple-600/20 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-blue-600/20 blur-xl"></div>
        </div>
    );
};

export default Error;