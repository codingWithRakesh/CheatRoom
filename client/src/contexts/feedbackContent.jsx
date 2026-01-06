import React, { createContext, useContext, useState } from 'react'

export const FeedbackContext = createContext()

const FeedbackContextProvider = ({ children }) => {
    const [isActive, setIsActive] = useState({
        isActive: false,
        isWhat : "report" // ideas or report
    })
    return (
        <FeedbackContext.Provider value={{ isActive, setIsActive }}>
            {children}
        </FeedbackContext.Provider>
    )
}
export default FeedbackContextProvider

export function useFeedback() {
    return useContext(FeedbackContext)
} 