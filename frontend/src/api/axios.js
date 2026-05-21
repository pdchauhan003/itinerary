import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5678/api',
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const orignalReq = error.config;
        if (error.response?.status == 401 && !orignalReq._retry) {
            orignalReq._retry = true;
            try {
                await axios.post('http://localhost:5678/api/auth/refresh', {}, { withCredentials: true });
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