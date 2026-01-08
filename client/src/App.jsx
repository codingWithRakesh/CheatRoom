import { useState, useEffect, useRef, Suspense } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
import { io } from "socket.io-client";
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar'
import fingerprintStore from "./store/fingerprintStore.js"
import messageStore from "./store/messageStore.js"
import Loading from './components/Loading.jsx';
import RightSideBar from './components/RightSideBar.jsx';
import { useRightSidebar } from './contexts/rightSIdebarContext.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';
import { useFeedback } from './contexts/feedbackContent.jsx';
import { dataToFormData } from './constants/constant.js';
import { handleSuccess } from './utils/toastUtils.js';
import feedbackStore from './store/feedbackStore.js';
import { useTime } from './contexts/timeContext.jsx';
import timeStore from './store/timeStore.js';

function App() {
  const { registerFingerprint, error, isLoading } = fingerprintStore();
  const { setSocket } = messageStore();
  const socketRef = useRef(null);
  const { isOpen, setIsOpen } = useRightSidebar();
  const { isActive, setIsActive } = useFeedback();
  const { submitFeedback } = feedbackStore();
  const {currentDate, setCurrentDate} = useTime();
  const { fetchCurrentTime } = timeStore();

  const navigate = useNavigate();
  useEffect(() => {
    async function checkFeedbackRedirect() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        localStorage.setItem("accessToken", token);

        window.history.replaceState({}, document.title, "/");

        navigate("/");
        const type = localStorage.getItem("feedbackType");
        setIsOpen(v => ({ ...v, isOpen: !v.isOpen, isWhat: "feedback" }))

        if (type === "report") {
          setIsOpen(v => ({ ...v, isOpen: true, isWhat: "" }))
          setIsActive(v => ({ ...v, isActive: true, isWhat: "report" }))
        } else if (type === "ideas") {
          setIsOpen(v => ({ ...v, isOpen: true, isWhat: "" }))
          setIsActive(v => ({ ...v, isActive: true, isWhat: "ideas" }))
        }

        const feedbackData = JSON.parse(localStorage.getItem("feedbackData"));
        if (feedbackData) {
          localStorage.removeItem("feedbackData");

          const formData = dataToFormData(feedbackData);
          await submitFeedback(formData);
          handleSuccess("Feedback submitted successfully!");
        }
        setIsOpen(v => ({ ...v, isOpen: !v.isOpen }))
        setIsActive(v => ({ ...v, isActive: false, isWhat: "" }))
      }
    }

    checkFeedbackRedirect();

  }, [navigate])


  useEffect(() => {
    const initializeApp = async () => {

      let visitorId = localStorage.getItem("visitorId");
      if (!visitorId) {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        visitorId = result.visitorId;
        localStorage.setItem("visitorId", visitorId);
      }

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCurrentTime(setCurrentDate);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [])



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
      <RightSideBar />
      <ToastContainer autoClose={2000} />
    </div>
  );
}

export default App;