import { create } from "zustand";
import axios from "axios";

const feedbackStore = create((set, get) => ({
    isLoading: false,
    error: null,
    message : null,

    submitFeedback: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.post(
                `${import.meta.env.VITE_FEEDBACK_BACKEND_URL}/feedback/create`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    },
                    // withCredentials: true
                }
            );
            set({ isLoading: false, message: "feedback submitted successfully" });
        } catch (error) {
            set({ isLoading: false, error: error.message });

            throw error;
        }
    },
    clearError: () => set({ error: null }),
    clearMessage: () => set({ message: null })

}));

export default feedbackStore;