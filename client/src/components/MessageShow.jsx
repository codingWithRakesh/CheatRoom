import React from 'react'
import { LuReplyAll } from 'react-icons/lu';
import { MdDone } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import ProfileColor from './ProfileColor';
import { FaRobot } from 'react-icons/fa6';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageShow = ({ 
    messages, 
    hoveredMessage, 
    setHoveredMessage, 
    handleReply, 
    handleCopy, 
    copiedMessageId, 
    messagesEndRef, 
    formatTime, 
    renderMessageWithCode, 
    truncateText 
}) => {
    
    const renderFileMessage = (msg) => {
        if (msg.isFile) {
            if (msg.fileType?.startsWith('image/')) {
                return (
                    <div className="group relative my-2.5">
                        <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                            <button 
                                onClick={() => window.open(msg.content, '_blank')}
                                className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                                title="View image"
                            >
                                <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3" />
                                </svg>
                            </button>
                        </div>
                        <img src={msg.content} alt={msg.fileName} className="rounded-lg max-w-full max-h-96" />
                    </div>
                );
            } else {
                // Document file
                const getFileIcon = (fileType) => {
                    if (fileType.includes('pdf')) return '📄';
                    if (fileType.includes('word')) return '📝';
                    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
                    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📑';
                    return '📁';
                };

                const formatFileSize = (bytes) => {
                    if (bytes === 0) return '0 Bytes';
                    const k = 1024;
                    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                };

                return (
                    <div className="flex items-start my-2.5 bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
                        <div className="me-2">
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white pb-2">
                                {getFileIcon(msg.fileType)} {msg.fileName}
                            </span>
                            <span className="flex text-xs font-normal text-gray-500 dark:text-gray-400 gap-2">
                                {formatFileSize(msg.size || 0)}
                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="self-center" width="3" height="4" viewBox="0 0 3 4" fill="none">
                                    <circle cx="1.5" cy="2" r="1.5" fill="#6B7280" />
                                </svg>
                                {msg.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                        </div>
                        <div className="inline-flex self-center items-center">
                            <button 
                                onClick={() => window.open(msg.content, '_blank')}
                                className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-600" 
                                type="button"
                                title="Download file"
                            >
                                <svg className="w-4 h-4 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                                    <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            }
        }
        return null;
    };

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
                                        {msg.isFile ? (
                                            renderFileMessage(msg)
                                        ) : (
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
                                        )}
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