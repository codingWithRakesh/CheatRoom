import { create } from "zustand";
import axios from "axios";

const roomStore = create((set, get) => ({
    isLoading: false,
    error: null,
    message: null,
    currentRoomCode: null,
    participants: [],
    
    generateRoomCode: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/room/generate`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                const roomCode = response.data.data.code;
                set({ 
                    isLoading: false, 
                    message: response.data.message, 
                    currentRoomCode: roomCode,
                    participants: [] 
                });
                return roomCode;
            } else {
                throw new Error("Failed to generate room code");
            }
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message, 
                isLoading: false 
            });
            throw error;
        }
    },
    
    joinRoom: async (code, visitorId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/room/join`,
                { code, visitorId },
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (response.status === 200) {
                set({ 
                    isLoading: false, 
                    message: response.data.message,
                    currentRoomCode: code
                });
                return true;
            } else {
                throw new Error("Failed to join room");
            }
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message, 
                isLoading: false 
            });
            throw error;
        }
    },
    
    exitRoom: async (code, visitorId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/room/exit`,
                { code, visitorId },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );

            if (response.status === 200) {
                set({ 
                    isLoading: false, 
                    message: response.data.message,
                    currentRoomCode: null,
                    participants: []
                });
                return true;
            } else {
                throw new Error("Failed to exit room");
            }
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message, 
                isLoading: false 
            });
            throw error;
        }
    },
    
    clearError: () => set({ error: null }),
    
    clearMessage: () => set({ message: null })
}));

export default roomStore;