import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your machine's IP address (run `ipconfig` or `ifconfig` to find it)
const API_URL = 'http://192.168.180.238:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    async (config) => {

        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            console.error('API Error:', error.response.status, error.config.url);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('API Error:', error.message);
        }


        // If the error is 401 and we haven't already tried to refresh
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');

                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    if (response.status === 200) {
                        const newAccessToken = response.data.access;
                        await AsyncStorage.setItem('accessToken', newAccessToken);

                        // Update the header for the original request
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        // Update the default header for future requests
                        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Optionally handle logout here or let the error propagate
            }
        }
        return Promise.reject(error);
    }
);

export default api;
