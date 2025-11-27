import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { FaServer, FaLightbulb, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const statusSteps = [
    'Waking up the server...',
    'Establishing secure connection...',
    'Booting up the database...',
    'Preparing your workspace...',
    'Almost there!'
];

const proTips = [
    'Tip: Use Ctrl+K to open the command palette for quick navigation.',
    'Did you know? Our new AI feature can help summarize your documents.',
    'Tip: Drag and drop files directly into the editor to upload them instantly.',
    'Did you know? You can invite team members from the settings panel.',
    'Tip: Customize your theme by going to Preferences > Appearance.'
];

const Loading = () => {
    const [statusText, setStatusText] = useState(statusSteps[0]);
    const [tipText, setTipText] = useState(proTips[0]);
    const [progress, setProgress] = useState(10);

    useEffect(() => {
        let stepIndex = 0;
        const statusInterval = setInterval(() => {
            stepIndex = (stepIndex + 1) % statusSteps.length;
            setStatusText(statusSteps[stepIndex]);
        }, 2500);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) { 
                    clearInterval(progressInterval);
                    return 95;
                }
                const randomIncrement = Math.floor(Math.random() * 8) + 2;
                return Math.min(prev + randomIncrement, 95);
            });
        }, 800);

        let tipIndex = 0;
        const tipInterval = setInterval(() => {
            tipIndex = (tipIndex + 1) % proTips.length;
            setTipText(proTips[tipIndex]);
        }, 5000);

        return () => {
            clearInterval(statusInterval);
            clearInterval(progressInterval);
            clearInterval(tipInterval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl mx-auto space-y-12"
                >
                    <div className="text-center">
                        <FaRocket className="mx-auto text-purple-500 text-5xl mb-6 animate-pulse" />
                        <h1 className="text-6xl sujoy1 font-bold text-gray-100 mb-4">
                            Preparing Your Experience
                        </h1>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={statusText}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-xl text-zinc-400 sujoy2 mt-4"
                            >
                                {statusText}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                            className="bg-gradient-to-r from-purple-600 to-indigo-500 h-2.5 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-3xl sujoy1 font-semibold text-sky-400 mb-3 flex items-center">
                                <FaServer className="w-6 h-6 mr-3" />
                                Why the wait?
                            </h3>
                            <p className="text-zinc-400 sujoy2 mt-2 text-sm">
                                Our application is hosted on a service that puts the server to sleep during inactivity. This initial load involves waking it up. Thanks for your patience!
                            </p>
                        </div>

                        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-3xl sujoy1 font-semibold text-teal-300 mb-3 flex items-center">
                                <FaLightbulb className="w-6 h-6 mr-3" />
                                Pro Tip
                            </h3>
                            <div className="relative h-16 flex items-center">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={tipText}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-zinc-300 sujoy2 text-sm italic absolute w-full"
                                    >
                                        "{tipText}"
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Loading;