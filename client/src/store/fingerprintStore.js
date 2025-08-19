import { create } from "zustand";
import axios from "axios";

const fingerprintStore = create((set) => ({
    isLoading: false,
    error: null,
    message: null,
    isRegistered: false,
    visitorId: null,
    
    registerFingerprint: async (visitorId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/fingerprint/register`,
                { visitorId },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );

            if (response.status === 201) {
                set({ 
                    isLoading: false, 
                    message: response.data.message,
                    isRegistered: true,
                    visitorId: visitorId
                });
            } else {
                set({ 
                    error: "Failed to register fingerprint",
                    isLoading: false 
                });
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

export default fingerprintStore;