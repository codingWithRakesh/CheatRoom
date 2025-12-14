import { create } from "zustand";
import axios from "axios";
import CryptoUtils from "../utils/cryptoUtils";
import { getErrorMessage } from "../constants/constant.js" 
import { handleError, handleSuccess } from "../utils/toastUtils.js";

const roomStore = create((set, get) => ({
    isLoading: false,
    error: null,
    message: null,
    currentRoomCode: null,
    participants: [],

    generateRoomCode: async (visitorId) => {
        set({ isLoading: true, error: null });
        try {
            const keyPair = await CryptoUtils.generateRSAKeyPair();

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/room/generate`,
                {
                    publicKey: keyPair.publicKey,
                    privateKey: keyPair.privateKey,
                    visitorId: visitorId
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
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
                error: getErrorMessage(error) || error.message,
                isLoading: false
            });
            handleError(get().error);
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
                error: getErrorMessage(error) || error.message,
                isLoading: false
            });
            handleError(get().error);
            throw error;
        }
    },

    getRoomPublicKey: async (roomCode) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/key/getPublicKey/${roomCode}`
            );

            if (response.status === 200) {
                return response.data.data.publicKey;
            }
            throw new Error("Failed to fetch public key");
        } catch (error) {
            console.error("Error fetching public key:", error);
            throw error;
        }
    },

    getRoomPrivateKey: async (roomCode) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/key/getByRoomCode/${roomCode}`
            );

            if (response.status === 200) {
                return response.data.data;
            }
            throw new Error("Failed to fetch private key");
        } catch (error) {
            console.error("Error fetching private key:", error);
            return null;
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
                error: getErrorMessage(error) || error.message,
                isLoading: false
            });
            handleError(get().error);
            throw error;
        }
    },

    deleteRoom: async (code, visitorId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/room/delete`,
                {
                    data: { code, visitorId },
                    headers: { "Content-Type": "application/json" },
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
                handleSuccess("Room deleted successfully");
                return true;
            } else {
                throw new Error("Failed to exit room");
            }
        } catch (error) {
            set({
                error: getErrorMessage(error) || error.message,
                isLoading: false
            });
            handleError(get().error);
            throw error;
        }
    },

    clearError: () => set({ error: null }),
    clearMessage: () => set({ message: null })
}));

export default roomStore;