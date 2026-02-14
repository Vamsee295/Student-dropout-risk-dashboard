import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api') + '/auth';

export const authService = {
    login: async (email: string, password: string) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        try {
            const response = await axios.post(`${API_URL}/login`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout: 10000, // 10s timeout
            });
            return response.data;
        } catch (error) {
            console.error("Login API Error:", error);
            throw error;
        }
    },

    getCurrentUser: async (token: string) => {
        try {
            const response = await axios.get(`${API_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 5000,
            });
            return response.data;
        } catch (error) {
            console.error("Get Current User Error:", error);
            throw error;
        }
    },

    forgotPassword: async (email: string) => {
        try {
            const response = await axios.post(`${API_URL}/forgot-password?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error("Forgot Password Error:", error);
            throw error;
        }
    },
};
