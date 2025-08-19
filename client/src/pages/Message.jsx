import React, { useState, useEffect, useRef } from 'react';
import { MdDone } from 'react-icons/md';
import { TbCopy } from 'react-icons/tb';
import SidebarChat from '../components/SidebarChat';
import { RiGeminiFill } from "react-icons/ri";
import { IoSendSharp } from "react-icons/io5";
import profile from "../assets/images/profile.jpeg";
import { LuReplyAll } from "react-icons/lu";
import { IoClose } from "react-icons/io5";

// Import Highlight.js and styles
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Import specific language support
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('javascript', javascript);

const Message = () => {
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [message, setMessage] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Here's an example of JavaScript code:
\`\`\`javascript
/**
 * Generates a Fibonacci series up to a specified number of terms.
 * @param {number} num - The number of terms to generate in the series.
 * @returns {number[]} An array containing the Fibonacci series.
 */
function fibonacciSeries(num) {
  // Handle edge cases for 0 or 1 term
  if (num <= 0) {
    return [];
  }
  if (num === 1) {
    return [0];
  }

  // Initialize with the first two numbers
  const series = [0, 1];

  // Loop to generate the rest of the series
  for (let i = 2; i < num; i++) {
    const nextFib = series[i - 1] + series[i - 2];
    series.push(nextFib);
  }

  return series;
}

// --- Example Usage ---
const numberOfTerms = 10;
const fibSequence = fibonacciSeries(numberOfTerms);

console.log(\`Fibonacci series with \${numberOfTerms} terms:\`); // Fibonacci series with 10 terms:
console.log(fibSequence); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

That's awesome. I think our users will really appreciate the improvements.`,
      sender: "Bonnie Green",
      time: "11:46",
      isMe: false
    },
    {
      id: 2,
      text: `Yes, I completely agree! The new features will make the experience much better for everyone.`,
      sender: "You",
      time: "11:48",
      isMe: true
    }
  ]);

  // Initialize Highlight.js and scroll to bottom
  useEffect(() => {
    // Highlight all code blocks on component mount and update
    hljs.highlightAll();
    
    // Scroll to bottom when messages change
    scrollToBottom();
    
    // Also highlight when messages change
    const timer = setTimeout(() => {
      hljs.highlightAll();
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

  const handleSend = () => {
    if (message.trim()) {
      // Process the message to handle code blocks
      let processedMessage = message;
      
      // Check if the message contains code blocks without language specification
      if (message.includes('```') && !message.includes('```javascript') && 
          !message.includes('```js') && !message.includes('```cpp')) {
        // Auto-detect JavaScript code if no language is specified
        if (message.includes('function') || message.includes('const') || 
            message.includes('let') || message.includes('console.log')) {
          processedMessage = message.replace(/```/g, '```javascript');
        }
      }
      
      const newMessage = {
        id: messages.length + 1,
        text: processedMessage,
        sender: "You",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        replyTo: replyTo ? {
          id: replyTo.id,
          text: replyTo.text,
          sender: replyTo.sender
        } : null
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      setReplyTo(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to truncate text for reply preview
  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    
    // Remove code blocks for preview
    const cleanText = text.replace(/```[\s\S]*?```/g, '');
    
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  // Function to parse message text and render code blocks with syntax highlighting
  const renderMessageWithCode = (text) => {
    if (!text) return null;
    
    // Split text by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const codeMatch = part.match(/```(\w+)?\s*([\s\S]*?)```/s);
        if (codeMatch) {
          const language = codeMatch[1] || 'javascript'; // Default to JavaScript
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
      
      // Regular text - split by newlines and render each line
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

  return (
    <div className='bg-transparent w-[85%] fixed left-1/2 -translate-x-1/2 bottom-[1.5rem] h-[85%] flex items-center justify-center gap-8'>
      <SidebarChat />
      <div className="messageShow h-full bg-gray-800 w-[70%] border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
        <div className="messageDivShow w-full flex-1 overflow-auto mb-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`w-full mb-4 flex ${msg.isMe ? 'justify-end' : 'justify-start'} relative group`}
              onMouseEnter={() => setHoveredMessage(msg.id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              {/* Action buttons for left-side messages (appear on right side on hover) */}
              {!msg.isMe && (
                <div className={`flex items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredMessage === msg.id ? 'opacity-100' : 'opacity-0'}`}>
                  <div 
                    className="replyOption cursor-pointer text-white flex items-center justify-center bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors"
                    onClick={() => handleReply(msg)}
                    title="Reply"
                  >
                    <LuReplyAll className="text-xl" />
                  </div>
                  <div 
                    className="copyButton cursor-pointer text-white flex items-center justify-center bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors"
                    onClick={() => handleCopy(msg.text, msg.id)}
                    title="Copy message"
                  >
                    {copiedMessageId === msg.id ? <MdDone className="text-xl text-green-500" /> : <TbCopy className="text-xl" />}
                  </div>
                </div>
              )}
              
              <div className={`flex items-start gap-2.5 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                <img className="w-8 h-8 rounded-full" src={profile} alt="Profile" />
                <div className={`flex flex-col gap-1 max-w-[40rem] ${msg.isMe ? 'items-end' : ''}`}>
                  <div className={`flex gap-2 items-center ${msg.isMe ? 'flex-row-reverse space-x-reverse' : 'space-x-2'} rtl:space-x-reverse`}>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.sender}</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{msg.time}</span>
                  </div>
                  
                  {/* Reply preview if this message is a reply */}
                  {msg.replyTo && (
                    <div className={`bg-gray-900/50 rounded-md p-2 text-xs max-w-full ${msg.isMe ? 'text-right' : 'text-left'}`}>
                      <p className="text-gray-400 truncate">Replying to {msg.replyTo.sender}</p>
                      <p className="text-gray-300 truncate">"{truncateText(msg.replyTo.text)}"</p>
                    </div>
                  )}
                  
                  <div className={`flex flex-col leading-1.5 p-4 border-gray-200 ${msg.isMe ? 'bg-blue-600 rounded-s-xl rounded-ee-xl' : 'bg-gray-700 rounded-e-xl rounded-es-xl'}`}>
                    <div className={`text-sm font-normal ${msg.isMe ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {renderMessageWithCode(msg.text)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons for right-side messages (appear on left side on hover) */}
              {msg.isMe && (
                <div className={`flex items-center gap-2 absolute left-0 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${hoveredMessage === msg.id ? 'opacity-100' : 'opacity-0'}`}>
                  <div 
                    className="replyOption cursor-pointer text-white flex items-center justify-center bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors"
                    onClick={() => handleReply(msg)}
                    title="Reply"
                  >
                    <LuReplyAll className="text-xl" />
                  </div>
                  <div 
                    className="copyButton cursor-pointer text-white flex items-center justify-center bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition-colors"
                    onClick={() => handleCopy(msg.text, msg.id)}
                    title="Copy message"
                  >
                    {copiedMessageId === msg.id ? <MdDone className="text-xl text-green-500" /> : <TbCopy className="text-xl" />}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="inputCChat w-[99%] min-h-[5rem] bg-gray-700/50 rounded-lg flex items-center justify-between px-4 py-2">
          <div className='h-[3rem] w-[3rem] bg-gray-600/50 rounded-full flex items-center justify-center'>
            <button className='text-white text-2xl h-full w-full flex items-center justify-center cursor-pointer'>
              <RiGeminiFill />
            </button>
          </div>
          
          <div className='flex-1 mx-4 my-2 flex flex-col'>
            {/* Reply preview */}
            {replyTo && (
              <div className="bg-gray-900/70 rounded-md p-2 mb-2 text-xs relative">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Replying to {replyTo.sender}</p>
                  <button 
                    onClick={cancelReply}
                    className="text-gray-400 hover:text-white"
                  >
                    <IoClose />
                  </button>
                </div>
                <p className="text-gray-300 truncate">"{truncateText(replyTo.text)}"</p>
              </div>
            )}
            
            <textarea 
              placeholder='Type your message...' 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className='w-full bg-transparent outline-none text-white resize-none'
              autoFocus 
              rows={1}
            />
          </div>
          
          <div className='h-[3rem] w-[3rem] bg-gray-600/50 rounded-full flex items-center justify-center'>
            <button 
              className='text-white text-2xl h-full w-full flex items-center justify-center cursor-pointer disabled:opacity-50'
              onClick={handleSend}
              disabled={!message.trim()}
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