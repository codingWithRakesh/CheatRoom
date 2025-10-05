import React, { useState, useEffect } from 'react';
import Navbar from './Navbar'; // Assuming this component exists
import { FaBolt, FaLightbulb } from 'react-icons/fa'; // Using react-icons for some nice visuals

const Loading = () => {
    // --- STATE MANAGEMENT FOR DYNAMIC CONTENT ---

    // 1. For the main loading status text
    const [statusText, setStatusText] = useState('Initializing connection...');
    const statusSteps = [
        'Waking up the server...',
        'Establishing secure connection...',
        'Loading user profile...',
        'Preparing your workspace...',
        'Almost ready!'
    ];

    // 2. For the "Pro Tips" or feature highlights
    const [tipText, setTipText] = useState('You can organize your projects into custom folders for better clarity.');
    const proTips = [
        'Tip: Use the keyboard shortcut Ctrl+S to quickly save your work.',
        'Did you know? Our new AI feature can help summarize your documents.',
        'Tip: Drag and drop files directly into the editor to upload them instantly.',
        'Did you know? You can invite team members from the settings panel.',
        'Tip: Customize your theme by going to Preferences > Appearance.'
    ];

    // --- EFFECTS TO CYCLE THE DYNAMIC CONTENT ---

    useEffect(() => {
        let stepIndex = 0;
        const statusInterval = setInterval(() => {
            stepIndex = (stepIndex + 1) % statusSteps.length;
            setStatusText(statusSteps[stepIndex]);
        }, 2200); // Change status text every 2.2 seconds

        return () => clearInterval(statusInterval);
    }, []);

    useEffect(() => {
        let tipIndex = 0;
        const tipInterval = setInterval(() => {
            tipIndex = (tipIndex + 1) % proTips.length;
            setTipText(proTips[tipIndex]);
        }, 4000); // Change tip every 4 seconds

        return () => clearInterval(tipInterval);
    }, []);


    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            <Navbar />
            
            <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 mt-16">
                <div className="w-full max-w-xl mx-auto">
                    
                    {/* --- MAIN STATUS SECTION --- */}
                    <div className="text-center">
                        <FaBolt className="mx-auto text-purple-500 text-5xl mb-4" />
                        <h1 className="text-6xl sujoy1 font-bold text-gray-100 mb-2">Preparing Your Experience</h1>
                        <p key={statusText} className="text-lg sujoy2 text-zinc-400 transition-opacity duration-300 animate-fade-in mt-2">
                            {statusText}
                        </p>
                    </div>

                    {/* --- "PRO TIP" CARD SECTION --- */}
                    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 shadow-lg mt-12">
                        <h3 className="text-4xl sujoy1 font-semibold text-teal-300 mb-3 flex items-center">
                            <FaLightbulb className="w-8 h-8 mr-2" />
                            Pro Tip
                        </h3>
                        <p key={tipText} className="text-zinc-300 mt-4 italic transition-opacity duration-500 animate-fade-in">
                           "{tipText}"
                        </p>
                    </div>

                    <p className="text-center sujoy2 text-sm text-zinc-600 mt-8">
                        This initial load may take a moment. Thanks for your patience! ☕
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Loading;