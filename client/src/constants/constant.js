import { useState, useEffect, useRef } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
import { io } from "socket.io-client";
import './App.css';

function App() {
  const [fingerprint, setFingerprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize fingerprint and socket
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get fingerprint
        const fp = await FingerprintJS.load();
        const { visitorId } = await fp.get();
        setFingerprint(visitorId);

        // Register fingerprint
        await axios.post(`${import.meta.env.VITE_CORS_ORIGIN_SERVER}/fingerprint/register`, {
          visitorId
        });

        // Initialize socket with fingerprint header
        socketRef.current = io("http://localhost:8000", {
          extraHeaders: {
            "fingerprint": visitorId
          }
        });

        // Socket event listeners
        socketRef.current.on("connect", () => {
          console.log("Connected with ID:", socketRef.current.id);
        });

        socketRef.current.on("message", (message) => {
          setMessages(prev => [...prev, {
            ...message,
            isOwn: message.senderId === visitorId
          }]);
        });

        socketRef.current.on("connect_error", (err) => {
          console.error("Connection error:", err);
          setError("Connection error. Please refresh.");
        });

      } catch (err) {
        setError(err.response?.data?.message || 'Initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when room changes
  useEffect(() => {
    if (currentRoom) {
      fetchMessages();
    }
  }, [currentRoom]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORS_ORIGIN_SERVER}/message/allMessages/${currentRoom}`
      );
      if (response.data.data && response.data.data[0]?.messages) {
        const formattedMessages = response.data.data[0].messages.map(msg => ({
          ...msg,
          isOwn: msg.senderId === fingerprint
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const generateRoomCode = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_CORS_ORIGIN_SERVER}/room/generate`);
      setGeneratedCode(response.data.data.code);
      setError(null);
    } catch (err) {
      setError('Failed to generate room code');
    }
  };

  const joinRoom = async () => {
    if (!roomCodeInput.match(/^\d{6}$/)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      // Join room in backend
      await axios.post(`${import.meta.env.VITE_CORS_ORIGIN_SERVER}/room/join`, {
        code: roomCodeInput,
        visitorId: fingerprint
      });

      const socketUserName = `${fingerprint}-${roomCodeInput}`;

      // Join socket room
      socketRef.current.emit("join-room", socketUserName);
      setCurrentRoom(roomCodeInput);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    }
  };

  const exitRoom = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_CORS_ORIGIN_SERVER}/room/exit`, {
        code: currentRoom,
        visitorId: fingerprint
      });
      setCurrentRoom(null);
      setMessages([]);
    } catch (err) {
      setError('Failed to exit room');
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !currentRoom) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_CORS_ORIGIN_SERVER}/message/sendMessage`, {
        content: messageInput,
        senderId: fingerprint,
        roomCode: currentRoom
      });
      setMessageInput("");
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (loading) {
    return <div className="container">Initializing...</div>;
  }

  if (error) {
    return (
      <div className="container error">
        Error: {error}
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Anonymous Chat</h1>
      <p>Your session ID: {fingerprint?.slice(0, 8)}...</p>

      {!currentRoom ? (
        <>
          <div className="joinContainer">
            <button onClick={generateRoomCode} className='generate-btn'>
              Generate Code
            </button>
            {generatedCode && <p>Your code: {generatedCode}</p>}
          </div>
          
          <div className="joinInput">
            <input
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
            />
            <button onClick={joinRoom} className='join-btn'>
              Join Room
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Room: {currentRoom}</h2>
          
          <div className="chatBBoxContainer border h-[500px] flex flex-col justify-between">
            <div className="chatShow border-b flex-1 overflow-y-auto">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`message p-3 mb-2 rounded-lg max-w-xs ${
                    msg.isOwn 
                      ? 'bg-blue-100 ml-auto' 
                      : 'bg-gray-200 mr-auto'
                  }`}
                >
                  {msg.isReply && (
                    <div className="text-xs text-gray-500 mb-1">
                      Replying to: {msg.parentmessageContent}
                    </div>
                  )}
                  <p>{msg.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="controllerChat flex p-2">
              <input 
                type="text" 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 border p-2 rounded-l"
                placeholder="Type your message..."
              />
              <button 
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-r"
              >
                Send
              </button>
            </div>
          </div>
          
          <button onClick={exitRoom} className="exit-btn mt-4">
            Exit Room
          </button>
        </>
      )}
    </div>
  );
}

export default App;