                                                                                                                                        import axios from "axios";
import {jwtDecode} from "jwt-decode"; // Correct the import for jwt-decode
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

// Create axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});
// Create a separate axios instance without interceptors for refreshing tokens
const refreshApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response, // Return the response if successful
    async (error) => {
        const originalRequest = error.config;

        // Check if the response status is 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent infinite loop

            // Attempt to refresh the token
            const refreshed = await refreshToken();
            if (refreshed) {
                // If the token was refreshed successfully, retry the original request
                const newAccessToken = localStorage.getItem(ACCESS_TOKEN);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest); // Retry the original request with the new token
            } else {
                // If refresh fails, redirect to login
                handleTokenExpired();
            }
        }

        return Promise.reject(error); // Return any other errors
    }
);

// Check if the token is present and valid
export const checkAuthorization = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return false;
    }

    try {
        // Decode the token to check its expiration time
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        // Check if the token has expired
        if (tokenExpiration < now) {
            const refreshed = await refreshToken(); // Try to refresh if expired
            return refreshed; // Return true if refreshed successfully
        }
        return true; // Token is valid
    } catch (error) {
        console.error('Error checking authorization:', error);
        return false;
    }
};

// Function to refresh the token
const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshToken) {
        // If there's no refresh token, handle token expiration
        handleTokenExpired();
        return false;
    }

    try {
        const res = await refreshApi.post('/api/token/refresh/', { refresh: refreshToken });
        if (res.status === 200) {
            // If refresh is successful, update the access token
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            return true;
        } else {
            // If the refresh token has expired, handle token expiration
            handleTokenExpired();
            return false;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        handleTokenExpired(); // Redirect to login in case of an error
        return false;
    }
};

// Function to handle token expiration
const handleTokenExpired = () => {
    localStorage.removeItem(ACCESS_TOKEN); // Clear tokens from localStorage
    localStorage.removeItem(REFRESH_TOKEN);
    // redirectToLogin(); // Redirect to the login page
};

// Function to redirect to login (you should adjust this according to your routing)
// const redirectToLogin = () => {
//     window.location.href = '/login'; // Replace with your actual login route
// };

export default api;
