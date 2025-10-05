import { useState, useEffect, useRef, Suspense } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
import { io } from "socket.io-client";
import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar'
import fingerprintStore from "./store/fingerprintStore.js"
import messageStore from "./store/messageStore.js"
import Loading from './components/Loading.jsx';

function App() {
  const { registerFingerprint, message, error, isLoading } = fingerprintStore();
  const { setSocket } = messageStore();
  const socketRef = useRef(null);

  useEffect(() => {
    const initializeApp = async () => {

      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();

      await registerFingerprint(visitorId);

      socketRef.current = io(`${import.meta.env.VITE_CORS}`, {
        extraHeaders: {
          "fingerprint": visitorId
        }
      });

      setSocket(socketRef.current);

      socketRef.current.on("connect", () => {
        // console.log("Connected with ID:", socketRef.current.id);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Connection error:", err);
      });

      socketRef.current.on('disconnect', () => {
        // console.log('User disconnected:', socketRef.current.id);
      });

    };

    initializeApp();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);


  if (isLoading) {
    return <Loading />;
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
    <div className='h-full w-full flex justify-center items-center bg-zinc-950'>
      <Navbar />
      <Suspense>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default App;