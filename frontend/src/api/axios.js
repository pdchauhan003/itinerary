import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Fallback to deployed URL if not on localhost
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://itineraryy.onrender.com/api';
    }
    return 'http://localhost:5678/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const orignalReq = error.config;
        if (error.response?.status == 401 && !orignalReq._retry) {
            orignalReq._retry = true;
            try {
                const apiBase = getBaseURL();
                await axios.post(`${apiBase}/auth/refresh`, {}, { withCredentials: true });
                return api(orignalReq);
            }
            catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;