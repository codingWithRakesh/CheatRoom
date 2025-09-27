import { create } from "zustand";
import axios from "axios";
import CryptoUtils from "../utils/cryptoUtils";
import roomStore from "./roomStore";

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
                    const processedMessages = await Promise.all(
                        response.data.data[0].messages.map(async (msg) => {
                            if (msg.isFile || msg.isAI) {
                                return {
                                    ...msg,
                                    isOwn: msg.senderId === fingerprint
                                };
                            }

                            if (CryptoUtils.isEncrypted(msg.content)) {
                                try {
                                    const privateKey = await roomStore.getState().getRoomPrivateKey(code);
                                    if (privateKey) {
                                        const decryptedContent = await CryptoUtils.decryptText(msg.content, privateKey);
                                        
                                        return {
                                            ...msg,
                                            content: decryptedContent,
                                            isOwn: msg.senderId === fingerprint,
                                            wasEncrypted: true
                                        };
                                    }
                                } catch (decryptError) {
                                    console.error("Failed to decrypt message:", decryptError);
                                    return {
                                        ...msg,
                                        content: "[Encrypted message - decryption failed]",
                                        isOwn: msg.senderId === fingerprint,
                                        decryptionError: true
                                    };
                                }
                            }

                            return {
                                ...msg,
                                isOwn: msg.senderId === fingerprint
                            };
                        })
                    );
                    
                    setMessages(processedMessages);
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

    sendMessage: async (content, senderId, roomCode, parentMessageId = null, isAI = false) => {
        set({ isLoading: true, error: null });
        try {
            let finalContent = content;

            if (!isAI) {
                try {
                    const publicKey = await roomStore.getState().getRoomPublicKey(roomCode);
                    if (publicKey) {
                        finalContent = await CryptoUtils.encryptText(content, publicKey);
                        // console.log("Message encrypted successfully");
                    }
                } catch (encryptError) {
                    console.error("Encryption failed, sending as plain text:", encryptError);
                }
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/message/sendMessage`,
                { 
                    content: finalContent, 
                    senderId, 
                    roomCode, 
                    parentMessageId, 
                    isAI 
                },
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

    sendFile: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/message/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                }
            );

            if (response.status === 200) {
                const newMessage = response.data.data;
                // console.log("File uploaded successfully");
                set({ isLoading: false, message: "File uploaded successfully" });
                return newMessage;
            } else {
                throw new Error("Failed to upload file");
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || error.message,
                isLoading: false
            });
            throw error;
        }
    },

    processIncomingMessage: async (messageData, roomCode, visitorId) => {
        if (messageData.isFile || messageData.isAI) {
            return {
                ...messageData,
                isOwn: messageData.senderId === visitorId
            };
        }

        if (CryptoUtils.isEncrypted(messageData.content)) {
            try {
                const privateKey = await roomStore.getState().getRoomPrivateKey(roomCode);
                if (privateKey) {
                    const decryptedContent = await CryptoUtils.decryptText(messageData.content, privateKey);
                    
                    return {
                        ...messageData,
                        content: decryptedContent,
                        isOwn: messageData.senderId === visitorId,
                        wasEncrypted: true
                    };
                }
            } catch (decryptError) {
                console.error("Failed to decrypt real-time message:", decryptError);
                return {
                    ...messageData,
                    content: "[Encrypted message - decryption failed]",
                    isOwn: messageData.senderId === visitorId,
                    decryptionError: true
                };
            }
        }

        return {
            ...messageData,
            isOwn: messageData.senderId === visitorId
        };
    },

    clearError: () => set({ error: null }),
    clearMessage: () => set({ message: null })
}));

export default messageStore;