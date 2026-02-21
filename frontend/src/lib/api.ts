import axios from 'axios';

// Use 127.0.0.1 to avoid IPv6 localhost resolution issues (e.g. Docker on Windows)
const raw = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
export const API_BASE_URL = raw.replace(/localhost/i, '127.0.0.1');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
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
    (response) => response,
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
