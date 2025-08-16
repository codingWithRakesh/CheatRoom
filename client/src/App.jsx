import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
import './App.css';

function App() {
  const [fingerprint, setFingerprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAndStoreFingerprint = async () => {
      try {
        // Initialize fingerprinting
        const fp = await FingerprintJS.load();
        const { visitorId } = await fp.get();
        setFingerprint(visitorId);

        // Send to server using Axios
        const response = await axios.post(`${import.meta.env.VITE_CORS_ORIGIN_SERVER}/fingerprint/register`, {
          visitorId
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Fingerprint stored:', response.data);

      } catch (err) {
        console.error('Fingerprint error:', err);
        setError(err.response?.data?.message || 'Failed to process fingerprint');
      } finally {
        setLoading(false);
      }
    };

    getAndStoreFingerprint();
  }, []);

  if (loading) {
    return <div className="container">Loading fingerprint...</div>;
  }

  if (error) {
    return <div className="container error">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>Anonymous Chat</h1>
      <p>Your secure session ID: {fingerprint}</p>
      <div className="joinContainer">
        <button className='p-4 border border-amber-800 rounded-2xl cursor-pointer'>Generate Code</button>
        <p>Show Code</p>
      </div>
      <div className="joinButton">
        <input type="text" className='border border-amber-800 rounded-2xl p-2' />
        <button className='p-4 border border-amber-800 rounded-2xl cursor-pointer'>Join Room</button>
      </div>
    </div>
  );
}

export default App;