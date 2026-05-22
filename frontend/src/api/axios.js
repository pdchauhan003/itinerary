import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5678/api',
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const orignalReq = error.config;
        if (error.response?.status == 401 && !orignalReq._retry) {
            orignalReq._retry = true;
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5678/api';
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