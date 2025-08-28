import React from 'react'
import { IoClose, IoSendSharp } from 'react-icons/io5'
import { RiGeminiFill } from 'react-icons/ri'

const MessageInput = ({ isAIEnabled, setIsAIEnabled, replyTo, cancelReply, messageInput, setMessageInput, handleKeyPress, handleSend, truncateText }) => {
    return (
        <div className="inputCChat w-[99%] min-h-[5rem] bg-gray-700/50 rounded-lg flex items-center justify-between px-4 py-2">
            <button
                className={`h-[3rem] w-[3rem] rounded-full flex items-center justify-center cursor-pointer transition-colors ${isAIEnabled
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600/50 text-gray-400 hover:bg-gray-600'
                    }`}
                onClick={() => setIsAIEnabled(!isAIEnabled)}
                title={isAIEnabled ? "AI mode enabled" : "Enable AI mode"}
            >
                <RiGeminiFill className="text-2xl" />
            </button>

            <div className='flex-1 mx-4 my-2 flex flex-col'>
                {replyTo && (
                    <div className="bg-gray-900/70 rounded-md p-2 mb-2 text-xs relative">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-400">Replying to {replyTo.isOwn ? "You" : `User ${replyTo.senderId?.slice(0, 8)}`}</p>
                            <button
                                onClick={cancelReply}
                                className="text-gray-400 hover:text-white"
                            >
                                <IoClose />
                            </button>
                        </div>
                        <p className="text-gray-300 truncate">"{truncateText(replyTo.content)}"</p>
                    </div>
                )}

                <div className="flex items-center">
                    {isAIEnabled && (
                        <span className="text-xs text-blue-400 mr-2 bg-blue-900/30 px-2 py-1 rounded">
                            AI Mode
                        </span>
                    )}
                    <textarea
                        placeholder={isAIEnabled ? "Ask AI a question..." : "Type your message..."}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className='w-full bg-transparent outline-none text-white resize-none'
                        autoFocus
                        rows={1}
                    />
                </div>
            </div>

            <div className='h-[3rem] w-[3rem] bg-gray-600/50 rounded-full flex items-center justify-center'>
                <button
                    className='text-white text-2xl h-full w-full flex items-center justify-center cursor-pointer disabled:opacity-50'
                    onClick={handleSend}
                    disabled={!messageInput.trim()}
                >
                    <IoSendSharp />
                </button>
            </div>
        </div>
    )
}

export default MessageInput