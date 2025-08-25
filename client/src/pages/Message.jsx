import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdDone } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import SidebarChat from '../components/SidebarChat';
import { RiGeminiFill } from "react-icons/ri";
import { IoSendSharp } from "react-icons/io5";
import { LuReplyAll } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { FaUser } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import fingerprintStore from '../store/fingerprintStore';
import messageStore from '../store/messageStore';
import ProfileColor from '../components/ProfileColor';

hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('javascript', javascript);

const Message = () => {
  const { code } = useParams();
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [currentMessageId, setCurrentMessageId] = useState(null);

  // Get state and actions from messageStore
  const {
    isLoading,
    error,
    message,
    socket,
    getMessages,
    sendMessage,
    clearError,
    clearMessage
  } = messageStore();

  const { visitorId } = fingerprintStore();

  // Use a ref to track if we've joined the room
  const hasJoinedRoom = useRef(false);

  // Initialize socket connection and join room
  useEffect(() => {
    if (!socket || !code || !visitorId || hasJoinedRoom.current) return;

    // Join the room using the same format as your working example
    const socketUserName = `${visitorId}-${code}`;
    console.log("Joining room:", socketUserName);
    socket.emit("join-room", socketUserName);
    hasJoinedRoom.current = true;

  }, []);

  // Socket event listener for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (messageData) => {
      console.log("New message received:", messageData);

      // Check if message already exists
      const messageExists = messages.some(msg =>
        msg._id === messageData._id ||
        (msg.tempId && msg.tempId === messageData.tempId)
      );

      if (!messageExists) {
        // Add the new message to local state
        setMessages(prev => {
          // if (currentMessageId && messageData.tempId === currentMessageId) {
          //   return prev;
          // }
          return [...prev, {
            ...messageData,
            isOwn: messageData.senderId === visitorId
          }]
        });
      }
    };

    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [socket, visitorId]); // Removed messages from dependencies

  // Fetch messages when component mounts or room changes
  useEffect(() => {
    if (code && visitorId) {
      getMessages(code, setMessages, visitorId).catch(err => {
        console.error("Error fetching messages:", err);
      });
    }
  }, [code, visitorId, getMessages]);

  // Handle errors from store
  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error, clearError]);

  // Handle success messages from store
  useEffect(() => {
    if (message) {
      console.log(message);
      clearMessage();
    }
  }, [message, clearMessage]);

  // Initialize Highlight.js and scroll to bottom
  useEffect(() => {
    // hljs.highlightAll();
    scrollToBottom();

    const timer = setTimeout(() => {
      // hljs.highlightAll();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleSend = useCallback(async () => {
    if (messageInput.trim() && code && visitorId) {
      try {
        let processedMessage = messageInput;

        // Auto-detect code language
        if (messageInput.includes('```') && !messageInput.includes('```javascript') &&
          !messageInput.includes('```js') && !messageInput.includes('```cpp')) {
          if (messageInput.includes('function') || messageInput.includes('const') ||
            messageInput.includes('let') || messageInput.includes('console.log')) {
            processedMessage = messageInput.replace(/```/g, '```javascript');
          }
        }

        // Create temporary message
        const tempId = Date.now();
        setCurrentMessageId(tempId);
        const tempMessage = {
          content: processedMessage,
          senderId: visitorId,
          timestamp: new Date(),
          tempId,
          isOwn: true,
          isReply: !!replyTo,
          parentmessageContent: replyTo?.content || null
        };

        // Add temporary message immediately
        // setMessages(prev => [...prev, tempMessage]);
        setMessageInput('');
        const currentReplyTo = replyTo;
        setReplyTo(null);

        // Send to API using store method
        await sendMessage(
          processedMessage,
          visitorId,
          code,
          currentReplyTo ? currentReplyTo._id : null
        );

      } catch (err) {
        console.error("Failed to send message:", err);
        // Remove temporary message on error
        setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
        setReplyTo(currentReplyTo);
      }
    }
  }, [messageInput, code, visitorId, replyTo, sendMessage]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    const cleanText = text.replace(/```[\s\S]*?```/g, '');
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  const renderMessageWithCode = (text) => {
    if (!text) return null;

    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeMatch = part.match(/```(\w+)?\s*([\s\S]*?)```/s);
        if (codeMatch) {
          const language = codeMatch[1] || 'javascript';
          const code = codeMatch[2].trim();

          return (
            <div key={index} className="my-2 rounded-lg overflow-hidden bg-gray-900">
              <div className="flex justify-between items-center bg-gray-800 px-4 py-2 text-xs text-gray-300">
                <span className="font-mono">{language}</span>
                <button
                  onClick={() => handleCopy(code, `code-${index}`)}
                  className="flex items-center gap-1 text-xs hover:text-white transition-colors"
                  title="Copy code"
                >
                  <TbCopy className="text-sm" />
                  Copy
                </button>
              </div>
              <pre className="m-0 p-4 overflow-x-auto">
                <code className={`language-${language} hljs`}>
                  {code}
                </code>
              </pre>
            </div>
          );
        }
      }

      const textLines = part.split('\n');
      return (
        <div key={index}>
          {textLines.map((line, lineIndex) => (
            <p key={lineIndex} className="mb-1 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      );
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!code) {
    return (
      <div className='bg-transparent w-[100%] fixed left-1/2 -translate-x-1/2 top-16 h-[calc(100vh-4rem)] flex items-center justify-center '>
        <div className="messageShow h-full bg-gray-800 w-[85%] border border-gray-700 rounded-lg p-4 flex items-center justify-center">
          <div className="text-white text-lg">Invalid room code</div>
        </div>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className='bg-transparent w-[100%] fixed left-1/2 -translate-x-1/2 top-16 h-[calc(100vh-4rem)] flex items-center justify-center '>
        <div className="messageShow h-full bg-gray-800 w-[85%] border border-gray-700 rounded-lg p-4 flex items-center justify-center">
          <div className="text-white text-lg">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-transparent w-[100%] fixed left-1/2 -translate-x-1/2 top-16 h-[92%] flex items-center justify-center '>
      {/* Hide SidebarChat on screens less than 1000px */}
      {/* <div className="hidden lg:block"> */}
        <SidebarChat />
      {/* </div> */}
      
      {/* Make chat area full width on small screens */}
      <div className="messageShow h-full bg-gray-800 lg:w-[85%] w-full border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        <div className="messageDivShow w-full flex-1 overflow-auto mb-4 pr-4">
          {messages.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const messageId = msg._id || msg.tempId || msg.id;

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
                    <ProfileColor userId={msg.senderId} />
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.isOwn ? 'items-end' : ''}`}>
                      <div className={`flex gap-2 items-center ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : 'space-x-2'} rtl:space-x-reverse`}>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {msg.isOwn ? "You" : `Anonymous`}
                        </span>
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{formatTime(msg.timestamp)}</span>
                      </div>

                      {msg.isReply && msg.parentmessageContent && (
                        <div className={`bg-gray-900/50 rounded-md p-2 text-xs max-w-full ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                          <p className="text-gray-400 truncate">Replying to a message</p>
                          <p className="text-gray-300 truncate">"{truncateText(msg.parentmessageContent)}"</p>
                        </div>
                      )}

                      <div className={`flex flex-col leading-1.5 p-4 border-gray-200 ${msg.isOwn ? 'bg-blue-600 rounded-s-xl rounded-ee-xl' : 'bg-gray-700 rounded-e-xl rounded-es-xl'}`}>
                        <div className={`text-sm font-normal ${msg.isOwn ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          {renderMessageWithCode(msg.content)}
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

        <div className="inputCChat w-[99%] min-h-[5rem] bg-gray-700/50 rounded-lg flex items-center justify-between px-4 py-2">
          <div className='h-[3rem] w-[3rem] bg-gray-600/50 rounded-full flex items-center justify-center'>
            <button className='text-white text-2xl h-full w-full flex items-center justify-center cursor-pointer'>
              <RiGeminiFill />
            </button>
          </div>

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

            <textarea
              placeholder='Type your message...'
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className='w-full bg-transparent outline-none text-white resize-none'
              autoFocus
              rows={1}
              disabled={isLoading}
            />
          </div>

          <div className='h-[3rem] w-[3rem] bg-gray-600/50 rounded-full flex items-center justify-center'>
            <button
              className='text-white text-2xl h-full w-full flex items-center justify-center cursor-pointer disabled:opacity-50'
              onClick={handleSend}
              disabled={!messageInput.trim() || isLoading}
            >
              <IoSendSharp />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;