import { create } from "zustand";
import axios from "axios";

const timeStore = create((set, get) => ({
    currentTime: null,
    isLoading: false,
    error: null,
    message : null,

    fetchCurrentTime: async (setCurrentDate) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_TIME_BACKEND_URL}/time/current`
            );
            set({ 
                currentTime: response.data.data.currentTime || new Date().toISOString(), 
                isLoading: false, 
                message: response.data.message 
            });
            setCurrentDate(new Date(response.data.data.currentTime || new Date().toISOString()));
            return response.data.data.currentTime || new Date().toISOString();
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    }
}));

export default timeStore;