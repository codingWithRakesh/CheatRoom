import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));

const PickerSpinner = () => (
    <div className="flex h-[400px] w-[320px] items-center justify-center rounded-lg bg-zinc-900 shadow-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-t-transparent"></div>
    </div>
);

export default function Emoji({ onSelect }) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);
    const buttonRef = useRef(null);

    const handleEmojiClick = (emojiData) => {
        onSelect(emojiData.emoji);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block">
            <motion.button
                ref={buttonRef}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPicker(!showPicker)}
                title="Toggle emoji picker"
                aria-label="Toggle emoji picker"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-yellow-400 transition-colors duration-200 hover:bg-zinc-700"
            >
                <BsEmojiSmile className="text-xl" />
            </motion.button>

            <AnimatePresence>
                {showPicker && (
                    <motion.div
                        ref={pickerRef}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.15 } }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        // --- THIS LINE IS CHANGED ---
                        className="absolute bottom-16 left-1/4 z-50 -translate-x-1/4 origin-bottom"
                    >
                        <Suspense fallback={<PickerSpinner />}>
                            <LazyEmojiPicker
                                onEmojiClick={handleEmojiClick}
                                theme="dark"
                                autoFocusSearch={false}
                                width={320}
                                height={400}
                                lazyLoadEmojis={true}
                            />
                        </Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}