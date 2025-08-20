import { useState, useEffect, useRef, Suspense } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
import { io } from "socket.io-client";
import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar'
import fingerprintStore from "./store/fingerprintStore.js"

function App() {
  const { registerFingerprint, message, error, isLoading } = fingerprintStore();

  useEffect(() => {
    const initializeApp = async () => {

      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();

      await registerFingerprint(visitorId);

    };

    initializeApp();
  }, []);


  if (isLoading) {
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
    <div className='h-screen w-screen flex justify-center items-center bg-gray-900'>
      <Navbar />
      <Suspense>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default App;