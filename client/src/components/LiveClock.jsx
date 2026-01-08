import React, { useState, useEffect, use } from 'react';
import timeStore from "../store/timeStore.js";
import { useTime } from '../contexts/timeContext.jsx';

export default function LiveClock() {
  const { fetchCurrentTime } = timeStore();
  const {currentDate, setCurrentDate} = useTime();

  useEffect(() => {
    fetchCurrentTime(setCurrentDate);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(prev => new Date(prev.getTime() + 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    const day = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    return `${day} ${date.getDate()} ${month}`;
  };

  return (
    <div className="flex items-center justify-between font-sans p-2">
      <div className="text-white text-3xl sujoy1 font-medium">
        <span>{formatTime(currentDate)}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(currentDate)}</span>
      </div>
    </div>
  );
}