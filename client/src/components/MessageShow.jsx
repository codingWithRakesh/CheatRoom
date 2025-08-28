import React from 'react'
import { LuReplyAll } from 'react-icons/lu';
import { MdDone } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import ProfileColor from './ProfileColor';
import { FaRobot } from 'react-icons/fa6';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageShow = ({ messages, hoveredMessage, setHoveredMessage, handleReply, handleCopy, copiedMessageId, messagesEndRef, formatTime, renderMessageWithCode, truncateText }) => {
    return (
        <div className="messageDivShow w-full flex-1 overflow-auto mb-4 pr-4">
            {messages.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                    No messages yet. Start the conversation!
                </div>
            ) : (
                messages.map((msg) => {
                    const messageId = msg._id || msg.tempId;

                    return (
                        <div
                            key={messageId}
                            className={`w-full mb-4 flex ${msg.isOwn ? 'justify-end' : 'justify-start'} relative group`}
                            onMouseEnter={() => setHoveredMessage(messageId)}
                            onMouseLeave={() => setHoveredMessage(null)}
                        >
                            {!msg.isOwn && (
                                <div className={`flex items-center gap-2 absolute right-16 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredMessage === messageId ? 'opacity-100' : 'opacity-0'}`}>
                                    <div
                                        className="replyOption cursor-pointer text-white flex items-center justify-center bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors"
                                        onClick={() => handleReply(msg)}
                                        title="Reply"
                                    >
                                        <LuReplyAll className="text-xl" />
                                    </div>
                                    <div
                                        className="copyButton cursor-pointer text-white flex items-center justify-center bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors"
                                        onClick={() => handleCopy(msg.content, messageId)}
                                        title="Copy message"
                                    >
                                        {copiedMessageId === messageId ? <MdDone className="text-xl text-green-500" /> : <TbCopy className="text-xl" />}
                                    </div>
                                </div>
                            )}

                            <div className={`flex items-start gap-2.5 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                                <ProfileColor userId={msg.senderId} isAI={msg.isAI} />
                                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.isOwn ? 'items-end' : ''}`}>
                                    <div className={`flex gap-2 items-center ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : 'space-x-2'} rtl:space-x-reverse`}>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {msg.isAI ? (
                                                <span className="flex items-center gap-1 text-blue-400">
                                                    <FaRobot className="text-blue-400" />
                                                    AI Assistant
                                                </span>
                                            ) : msg.isOwn ? "You" : `Anonymous`}
                                        </span>
                                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{formatTime(msg.timestamp)}</span>
                                    </div>

                                    {msg.isReply && msg.parentmessageContent && (
                                        <div className={`bg-gray-900/50 rounded-md p-2 text-xs max-w-full ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                                            <p className="text-gray-400 truncate">Replying to a message</p>
                                            <p className="text-gray-300 truncate">"{truncateText(msg.parentmessageContent)}"</p>
                                        </div>
                                    )}

                                    <div className={`flex flex-col leading-1.5 p-4 border-gray-200 ${msg.isOwn ? 'bg-blue-600 rounded-s-xl rounded-ee-xl' : msg.isAI ? 'bg-blue-900/30 rounded-e-xl rounded-es-xl' : 'bg-gray-700 rounded-e-xl rounded-es-xl'}`}>
                                        <div className={`text-sm font-normal ${msg.isOwn ? 'text-white' : msg.isAI ? 'text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, inline, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={dracula}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {msg.isOwn && (
                                <div className={`flex items-center gap-2 absolute left-12 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredMessage === messageId ? 'opacity-100' : 'opacity-0'}`}>
                                    <div
                                        className="replyOption cursor-pointer text-white flex items-center justify-center bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors"
                                        onClick={() => handleReply(msg)}
                                        title="Reply"
                                    >
                                        <LuReplyAll className="text-xl" />
                                    </div>
                                    <div
                                        className="copyButton cursor-pointer text-white flex items-center justify-center bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors"
                                        onClick={() => handleCopy(msg.content, messageId)}
                                        title="Copy message"
                                    >
                                        {copiedMessageId === messageId ? <MdDone className="text-xl text-green-500" /> : <TbCopy className="text-xl" />}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default MessageShow