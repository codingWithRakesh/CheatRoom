import React from 'react';
import Navbar from './Navbar';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 py-12 md:py-24 lg:py-32">
        <div className="w-full max-w-md mx-auto text-center">
          {/* Animated spinner */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-8 border-4 border-transparent border-b-indigo-400 rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-12 border-4 border-transparent border-l-purple-400 rounded-full animate-spin-slow"></div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-4">Preparing Your Experience</h2>
          
          {/* Message */}
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Our web application is getting everything ready for you. This process 
            typically takes <span className="font-semibold text-blue-300">2-3 minutes</span>. 
            Thank you for your patience!
          </p>
          
          {/* Progress indicator */}
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-400 h-2.5 rounded-full w-2/3 animate-pulse"></div>
          </div>
          
          {/* Timer indicator */}
          <div className="inline-flex items-center px-4 py-2 bg-gray-800 rounded-lg mb-8">
            <svg className="w-5 h-5 mr-2 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-blue-300 font-medium">Estimated time: 2-3 minutes</span>
          </div>
          
          {/* Additional information */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-teal-300 mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Did you know?
            </h3>
            <p className="text-gray-300 italic">
              While you wait, our system is optimizing content and ensuring the best performance for your session.
            </p>
          </div>
          
          {/* Tips for waiting */}
          <div className="mt-6 text-sm text-gray-400">
            <p>Feel free to grab a coffee while we prepare everything for you ☕</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;