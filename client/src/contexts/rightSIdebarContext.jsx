import React, { createContext, useContext, useState } from 'react'

export const RightSidebarContext = createContext()

const RightSidebarContextProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <RightSidebarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </RightSidebarContext.Provider>
    )
}
export default RightSidebarContextProvider

export function useRightSidebar() {
    return useContext(RightSidebarContext)
} 