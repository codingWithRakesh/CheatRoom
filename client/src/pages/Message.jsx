import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdDone } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import SidebarChat from '../components/SidebarChat';
import { RiGeminiFill } from "react-icons/ri";
import { IoSendSharp } from "react-icons/io5";
import { LuReplyAll } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { FaUser, FaRobot } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import fingerprintStore from '../store/fingerprintStore';
import messageStore from '../store/messageStore';
import roomStore from '../store/roomStore.js';
import CryptoUtils from '../utils/cryptoUtils.js';
import ProfileColor from '../components/ProfileColor';
import MessageInput from '../components/MessageInput';
import MessageShow from '../components/MessageShow';

hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('javascript', javascript);

const Message = () => {
  const { code } = useParams();
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [isEncryptionReady, setIsEncryptionReady] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    isLoading,
    error,
    message,
    socket,
    getMessages,
    sendMessage,
    sendFile,
    clearError,
    clearMessage,
    processIncomingMessage
  } = messageStore();

  const { visitorId } = fingerprintStore();
  const { getRoomPublicKey, getRoomPrivateKey } = roomStore();

  const hasJoinedRoom = useRef(false);


  useEffect(() => {
    const initializeEncryption = async () => {
      if (!code) return;
      
      try {
        await getRoomPublicKey(code);
        await getRoomPrivateKey(code);
        setIsEncryptionReady(true);
        // console.log("Encryption initialized for room:", code);
      } catch (error) {
        console.error("Failed to initialize encryption:", error);
        setIsEncryptionReady(true);
      }
    };

    initializeEncryption();
  }, [code, getRoomPublicKey, getRoomPrivateKey]);

  useEffect(() => {
    if (!socket || !code || !visitorId || hasJoinedRoom.current) return;

    const socketUserName = `${visitorId}-${code}`;
    socket.emit("join-room", socketUserName);
    hasJoinedRoom.current = true;
  }, [socket, code, visitorId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (messageData) => {
      const messageExists = messages.some(msg =>
        msg._id === messageData._id ||
        (msg.tempId && msg.tempId === messageData.tempId)
      );

      if (!messageExists) {
        try {
          let processedMessage = {
            ...messageData,
            isOwn: messageData.senderId === visitorId
          };

          if (!messageData.isFile && !messageData.isAI && isEncryptionReady) {
            try {
              processedMessage = await processIncomingMessage(messageData, code, visitorId);
            } catch (decryptError) {
              console.error("Failed to decrypt real-time message:", decryptError);
              processedMessage = {
                ...messageData,
                isOwn: messageData.senderId === visitorId,
                decryptionError: true,
                content: "[Encrypted message - decryption failed]"
              };
            }
          }

          setMessages(prev => {
            return [...prev, processedMessage];
          });
        } catch (error) {
          console.error("Error processing incoming message:", error);
          setMessages(prev => [...prev, {
            ...messageData,
            isOwn: messageData.senderId === visitorId
          }]);
        }
      }
    };

    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [socket, visitorId, code, messages, isEncryptionReady, processIncomingMessage]);

  useEffect(() => {
    if (code && visitorId && isEncryptionReady) {
      getMessages(code, setMessages, visitorId).catch(err => {
        console.error("Error fetching messages:", err);
      });
    }
  }, [code, visitorId, getMessages, isEncryptionReady]);

  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [message, clearMessage]);

  useEffect(() => {
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

        const tempId = Date.now();
        const tempMessage = {
          content: processedMessage,
          senderId: visitorId,
          timestamp: new Date(),
          tempId,
          isOwn: true,
          isReply: !!replyTo,
          parentmessageContent: replyTo?.content || null,
          isAI: isAIEnabled
        };

        setMessages(prev => [...prev, tempMessage]);
        setMessageInput('');
        const currentReplyTo = replyTo;
        setReplyTo(null);

        sendMessage(
          processedMessage,
          visitorId,
          code,
          currentReplyTo ? currentReplyTo._id : null,
          isAIEnabled
        ).catch(err => {
          console.error("Failed to send message:", err);
          setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
          setReplyTo(currentReplyTo);
        });

        setIsAIEnabled(false);

      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  }, [messageInput, code, visitorId, replyTo, sendMessage, isAIEnabled]);


  const handleFileUpload = async (file) => {
    if (!code || !visitorId) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('senderId', visitorId);
      formData.append('roomCode', code);

      const tempId = Date.now();
      const tempMessage = {
        content: URL.createObjectURL(file),
        senderId: visitorId,
        timestamp: new Date(),
        tempId,
        isOwn: true,
        isFile: true,
        fileName: file.name,
        fileType: file.type,
        size: file.size
      };

      setMessages(prev => [...prev, tempMessage]);

      await sendFile(formData);

    } catch (err) {
      console.error("Failed to upload file:", err);
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      alert(err.response?.data?.message || "Failed to upload file");
    }
  };

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

  const isMessageEncrypted = (message) => {
    return message.wasEncrypted || message.decryptionError;
  };

  if (!code) {
    return (
      <div className='bg-zinc-950 w-[100%] fixed left-1/2 -translate-x-1/2 top-16 h-[calc(100vh-4rem)] flex items-center justify-center '>
        <div className="messageShow h-full bg-gray-800 w-[85%] border border-gray-700 rounded-lg p-4 flex items-center justify-center">
          <div className="text-white text-lg">Invalid room code</div>
        </div>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className='bg-zinc-950 w-[100%] fixed left-1/2 -translate-x-1/2 top-16 h-[calc(100vh-4rem)] flex items-center justify-center '>
        <div className="messageShow h-full w-full p-4 flex items-center justify-center">
          <div className="text-white text-lg sujoy1">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-[100%] bg-zinc-950 fixed left-1/2 -translate-x-1/2 top-16 h-[92%] flex items-center justify-center'>
      <SidebarChat />

      <div className="messageShow h-full w-full p-0 flex flex-col items-center justify-center">
        {isLoading && messages.length === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {isEncryptionReady && (
          <div className="w-full text-center mb-2 p-2">
            <span className="text-sm sujoy2 text-green-400 bg-green-900/30 px-2 py-1 rounded">
              🔒 End-to-end encryption active
            </span>
          </div>
        )}

        <MessageShow
          messages={messages}
          hoveredMessage={hoveredMessage}
          setHoveredMessage={setHoveredMessage}
          handleReply={handleReply}
          handleCopy={handleCopy}
          copiedMessageId={copiedMessageId}
          messagesEndRef={messagesEndRef}
          formatTime={formatTime}
          renderMessageWithCode={renderMessageWithCode}
          truncateText={truncateText}
          isMessageEncrypted={isMessageEncrypted}
        />

        <MessageInput
          isAIEnabled={isAIEnabled}
          setIsAIEnabled={setIsAIEnabled}
          replyTo={replyTo}
          cancelReply={cancelReply}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          handleKeyPress={handleKeyPress}
          handleSend={handleSend}
          truncateText={truncateText}
          onFileUpload={handleFileUpload}
          isEncryptionReady={isEncryptionReady}
        />

      </div>
    </div>
  );
};

export default Message;