import { create } from "zustand";
import axios from "axios";

const messageStore = create((set, get) => ({
    isLoading: false,
    error: null,
    message: null,
    messages: [],
    currentRoomCode: null,

    getMessages: async (code) => {
        set({ isLoading: true, error: null, currentRoomCode: code });
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/message/allMessages/${code}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );

            if (response.status === 200) {
                const messages = response.data.data[0]?.messages || [];
                set({ 
                    isLoading: false, 
                    messages: messages,
                    currentRoomCode: code
                });
                return messages;
            } else {
                throw new Error("Failed to fetch messages");
            }
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message, 
                isLoading: false,
                messages: []
            });
            throw error;
        }
    },
    
    sendMessage: async (content, senderId, roomCode, parentMessageId = null) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/message/sendMessage`,
                { content, senderId, roomCode, parentMessageId },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );

            if (response.status === 201) {
                const newMessage = response.data.data;
                
                set((state) => ({
                    isLoading: false,
                    messages: [...state.messages, newMessage],
                    message: "Message sent successfully"
                }));
                
                return newMessage;
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message, 
                isLoading: false 
            });
            throw error;
        }
    },

    addMessage: (newMessage) => {
        set((state) => ({
            messages: [...state.messages, newMessage]
        }));
    },
    

    clearMessages: () => set({ messages: [], currentRoomCode: null }),
    
 
    clearError: () => set({ error: null }),
    

    clearMessage: () => set({ message: null })
}));

export default messageStore;