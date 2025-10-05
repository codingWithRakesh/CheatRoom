import React, { useRef, useEffect } from 'react';
import { IoClose, IoSendSharp, IoAttach } from 'react-icons/io5';
import { RiGeminiFill } from 'react-icons/ri';

const MessageInput = ({
    isAIEnabled,
    setIsAIEnabled,
    replyTo,
    cancelReply,
    messageInput,
    setMessageInput,
    handleKeyPress,
    handleSend,
    truncateText,
    onFileUpload
}) => {
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    // This effect handles resizing the textarea based on its content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`; // Set to content height
        }
    }, [messageInput]);


    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileUpload(file);
        }
        event.target.value = ''; // Reset file input
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Make sure the truncateText function is passed in as a prop
    // If it's not available, you can define a simple one here for safety:
    const safeTruncateText = truncateText || ((text, length) => text.substring(0, length));


    return (
        // Main container with padding to give the component some space
        <div className="w-full">
            <div className="w-full flex flex-col">
                
                {/* Reply-to Block: Positioned above the input bar for clarity */}
                {replyTo && (
                    <div className="bg-zinc-900 rounded-t-lg p-2 px-3 text-sm relative border-b border-zinc-700">
                        <div className="flex justify-between items-center">
                            <p className="text-white sujoy1 text-lg">
                                Replying to {replyTo.isOwn ? "yourself" : `User ${replyTo.senderId?.slice(0, 6)}`}
                            </p>
                            <button
                                onClick={cancelReply}
                                className="text-gray-400 cursor-pointer hover:text-white transition-colors p-1 rounded-full"
                                aria-label="Cancel reply"
                            >
                                <IoClose size={18} />
                            </button>
                        </div>
                        <p className="text-gray-300 sujoy2 truncate mt-1">
                           "{safeTruncateText(replyTo.content, 90)}"
                        </p>
                    </div>
                )}

                {/* Main input bar: A single cohesive unit */}
                <div className="bg-black h-20 w-full flex items-center gap-2 px-4 py-4 transition-all">
                    {/* Left-side action buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300
                                ${isAIEnabled
                                    ? 'bg-blue-600 text-white transform rotate-180'
                                    : 'bg-zinc-800 text-gray-200 hover:bg-blue-500/10'
                                }`}
                            onClick={() => setIsAIEnabled(!isAIEnabled)}
                            title={isAIEnabled ? "Disable AI Mode" : "Enable AI Mode"}
                        >
                            <RiGeminiFill className="text-2xl" />
                        </button>
                        <button
                            className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-zinc-800 text-gray-200 hover:bg-zinc-700 cursor-pointer transition-colors"
                            onClick={triggerFileInput}
                            title="Attach file"
                        >
                            <IoAttach className="text-2xl" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf"
                        />
                    </div>
                    
                    {/* Textarea with AI badge integrated */}
                    <div className="flex-1 relative">
                         {isAIEnabled && (
                            <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full absolute -top-5 left-1">
                                AI Assistant
                            </span>
                        )}
                        <textarea
                            ref={textareaRef}
                            placeholder={isAIEnabled ? "Ask AI anything..." : "Type a message..."}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='w-full bg-transparent outline-none text-white text-base resize-none px-2 py-2 max-h-40 overflow-y-auto'
                            autoFocus
                            rows={1}
                        />
                    </div>

                    {/* Send Button -- FIXED HERE */}
                    <button
                        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        ${messageInput.trim() ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-gray-400'}`}
                        onClick={handleSend}
                        disabled={!messageInput.trim()}
                        title="Send Message"
                    >
                        <IoSendSharp className="text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;