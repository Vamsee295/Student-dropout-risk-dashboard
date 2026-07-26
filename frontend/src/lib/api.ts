import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        try {
            const raw = localStorage.getItem('auth-storage');
            if (raw) {
                const parsed = JSON.parse(raw);
                const token = parsed?.state?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch {
            // localStorage unavailable or parse error — proceed without token
        }
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        if (response.data && response.data.success !== undefined && 'data' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
