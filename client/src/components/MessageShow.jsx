import React from 'react'
import { LuReplyAll } from 'react-icons/lu';
import { MdDone } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import ProfileColor from './ProfileColor';
import { FaRobot } from 'react-icons/fa6';
import { FaFilePdf } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { RiFileExcel2Fill, RiFileWord2Fill } from 'react-icons/ri';
import { PiMicrosoftPowerpointLogoFill } from "react-icons/pi";
import view1 from "../assets/images/view1.jpg";

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
    truncateText,
    isMessageEncrypted
}) => {

    const handleDownload = async (url, fileName = "download") => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const isMessageEncryptedLocal = (msg) => {
        return msg.wasEncrypted || msg.decryptionError;
    };

    const getEncryptionStatus = (msg) => {
        if (msg.decryptionError) {
            return {
                icon: '⚠️',
                tooltip: 'Decryption failed',
                className: 'text-red-400'
            };
        }
        if (msg.wasEncrypted) {
            return {
                icon: '🔒',
                tooltip: 'End-to-end encrypted',
                className: 'text-green-400'
            };
        }
        return null;
    };

    const renderFileMessage = (msg) => {
        if (msg.isFile) {
            if (msg.fileType?.startsWith('image/')) {
                return (
                    <div className="group relative my-2.5 p-0">
                        <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                            <button
                                onClick={() => window.open(msg.content, '_blank')}
                                className="inline-flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
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

                const getFileIcon = (fileType) => {
                    if (fileType.includes('pdf')) return <FaFilePdf />;
                    if (fileType.includes('word')) return <RiFileWord2Fill />;
                    if (fileType.includes('excel') || fileType.includes('sheet')) return <RiFileExcel2Fill />;
                    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <PiMicrosoftPowerpointLogoFill />;
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
                    <div className="flex items-start my-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl p-2">
                        <div className="me-2">
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white pb-2">
                                <span className='text-[2rem]'>
                                    {getFileIcon(msg.fileType)}
                                </span> {msg.fileName}
                            </span>
                            <span className="flex items-center justify-end text-xs font-normal text-gray-500 dark:text-gray-400 gap-2">
                                {msg.fileType.split('/')[1]?.split('.').pop()?.toUpperCase() || 'FILE'}
                            </span>
                        </div>
                        <div className="inline-flex self-center items-center">
                            <button
                                onClick={() => handleDownload(msg.content, msg.fileName)}
                                className="inline-flex cursor-pointer self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-600"
                                type="button"
                                title="Download file"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-900 dark:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
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
        <div className="messageDivShow w-full flex-1 overflow-auto mb-4 px-4">
            {messages.length === 0 ? (
                <div className="text-gray-400 sujoy2 text-center py-8">
                    No messages yet. Start the conversation!
                </div>
            ) : (
                messages.map((msg) => {
                    const messageId = msg._id || msg.tempId;
                    const encryptionStatus = getEncryptionStatus(msg);

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
                                        className="replyOption cursor-pointer text-white flex items-center justify-center hover:bg-blue-800/50 rounded-full p-2 bg-zinc-700 transition-colors"
                                        onClick={() => handleReply(msg)}
                                        title="Reply"
                                    >
                                        <LuReplyAll className="text-xl" />
                                    </div>
                                    <div
                                        className="copyButton cursor-pointer text-white flex items-center justify-center hover:bg-green-900/50 rounded-full p-2 bg-zinc-700 transition-colors"
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
                                    <div className={`flex gap-1 items-center ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : 'space-x-2'} rtl:space-x-reverse`}>
                                        <span className="text-xl font-semibold sujoy1 text-white">
                                            {msg.isAI ? (
                                                <span className="flex items-center gap-1 text-blue-400">
                                                    <FaRobot className="text-blue-400" />
                                                    AI Assistant
                                                </span>
                                            ) : msg.isOwn ? "You" : `Anonymous`}
                                        </span>

                                        {encryptionStatus && !msg.isFile && !msg.isAI && (
                                            <span
                                                className={`text-xs ${encryptionStatus.className}`}
                                                title={encryptionStatus.tooltip}
                                            >
                                                {encryptionStatus.icon}
                                            </span>
                                        )}

                                        <span className="text-sm sujoy1 font-normal text-gray-500 dark:text-gray-400">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>

                                    {msg.isReply && msg.parentmessageContent && (
                                        <div className={`bg-gray-900/50 rounded-md p-2 text-xs max-w-full ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                                            <p className="text-gray-400 truncate sujoy2">Replying to a message</p>
                                            <p className="text-gray-300 truncate sujoy2 text-md">"{truncateText(msg.parentmessageContent)}"</p>
                                        </div>
                                    )}

                                    <div className={`flex flex-col p-4 leading-1.5 ${msg.isOwn ? 'bg-blue-800 rounded-s-xl rounded-ee-xl' : msg.isAI ? 'bg-blue-900/30 rounded-e-xl rounded-es-xl' : 'bg-zinc-900 rounded-e-xl rounded-es-xl'}`}>
                                        <div className={`text-sm font-semibold ${msg.isOwn ? 'text-white' : msg.isAI ? 'text-blue-100' : 'text-gray-900 dark:text-white'} inline-block max-w-[60%] min-w-[4ch] whitespace-normal break-words`}>
                                            {msg.isFile ? (
                                                renderFileMessage(msg)
                                            ) : (
                                                <div className={`text-sm font-semibold ${msg.isOwn ? 'text-white' : msg.isAI ? 'text-blue-100' : 'text-gray-900 dark:text-white'} whitespace-pre-wrap break-words`}>
                                                    {msg.decryptionError ? (
                                                        <div className="flex items-center gap-2 text-orange-300">
                                                            <span>⚠️</span>
                                                            <span className="italic">{msg.content}</span>
                                                        </div>
                                                    ) : (
                                                        <ReactMarkdown
                                                            components={{
                                                                pre({ node, ...props }) {
                                                                    return (
                                                                        <div className="my-2 overflow-x-auto max-w-full rounded-md">
                                                                            <pre className="whitespace-pre max-w-full" {...props} />
                                                                        </div>
                                                                    );
                                                                },
                                                                code({ node, inline, className, children, ...props }) {
                                                                    const match = /language-(\w+)/.exec(className || '');
                                                                    if (!inline && match) {
                                                                        return (
                                                                            <div className="my-2 overflow-x-auto max-w-full rounded-md">
                                                                                <SyntaxHighlighter
                                                                                    style={dracula}
                                                                                    language={match[1]}
                                                                                    PreTag="div"
                                                                                    className="!max-w-none"
                                                                                    {...props}
                                                                                >
                                                                                    {String(children).replace(/\n$/, '')}
                                                                                </SyntaxHighlighter>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <code className="break-words whitespace-pre-wrap px-1 rounded bg-black/10" {...props}>
                                                                            {children}
                                                                        </code>
                                                                    );
                                                                },
                                                                p({ node, children, ...props }) {
                                                                    return <p className="whitespace-pre-wrap break-words" {...props}>{children}</p>;
                                                                }
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    )}
                                                </div>
                                            )}

                                            {msg.isFile && encryptionStatus && (
                                                <div className="mt-2 flex justify-end">
                                                    <span
                                                        className={`text-xs ${encryptionStatus.className} bg-black/30 px-2 py-1 rounded-full`}
                                                        title={encryptionStatus.tooltip}
                                                    >
                                                        {encryptionStatus.icon} {encryptionStatus.tooltip}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {msg.decryptionError && (
                                        <div className="text-xs mt-1 sujoy2">
                                            This message could not be decrypted. It may be from a different room session.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {msg.isOwn && (
                                <div className={`flex items-center gap-2 absolute left-16 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredMessage === messageId ? 'opacity-100' : 'opacity-0'}`}>
                                    <div
                                        className="replyOption cursor-pointer text-white flex items-center justify-center bg-zinc-800 rounded-full p-2 hover:bg-blue-900/50 transition-colors"
                                        onClick={() => handleReply(msg)}
                                        title="Reply"
                                    >
                                        <LuReplyAll className="text-xl" />
                                    </div>
                                    <div
                                        className="copyButton cursor-pointer text-white flex items-center justify-center bg-zinc-800 rounded-full p-2 hover:bg-green-900/50 transition-colors"
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