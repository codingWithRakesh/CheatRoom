import React, { createContext, useContext, useState } from 'react'

export const TimeContext = createContext()

const TimeContextProvider = ({ children }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    return (
        <TimeContext.Provider value={{ currentDate, setCurrentDate }}>
            {children}
        </TimeContext.Provider>
    )
}
export default TimeContextProvider

export function useTime() {
    return useContext(TimeContext)
} 