import { create } from "zustand";
import axios from "axios";

const messageStore = create((set, get) => ({
    isLoading: false,
    error: null,
    message: null,
    currentRoomCode: null,
    socket: null,
    setSocket: (socket) => set({ socket }),

    getMessages: async (code, setMessages, fingerprint) => {
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
                if (response.data.data && response.data.data[0]?.messages) {
                    const formattedMessages = response.data.data[0].messages.map(msg => ({
                        ...msg,
                        isOwn: msg.senderId === fingerprint
                    }));
                    setMessages(formattedMessages);
                }
                set({ isLoading: false, currentRoomCode: code });
                return response.data.data[0]?.messages || [];
            } else {
                throw new Error("Failed to fetch messages");
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || error.message,
                isLoading: false
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
                set({ isLoading: false, message: "Message sent successfully" });
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

    clearError: () => set({ error: null }),
    clearMessage: () => set({ message: null })
}));

export default messageStore;