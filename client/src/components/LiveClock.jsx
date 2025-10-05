import React, { useState, useEffect } from 'react';

export default function LiveClock() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    const dayOptions = { weekday: 'short' }; // e.g., "Sun"
    const monthOptions = { month: 'short' }; // e.g., "Oct"
    
    const day = new Intl.DateTimeFormat('en-US', dayOptions).format(date);
    const dayOfMonth = date.getDate();
    const month = new Intl.DateTimeFormat('en-US', monthOptions).format(date);
    
    return `${day} ${dayOfMonth} ${month}`;
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