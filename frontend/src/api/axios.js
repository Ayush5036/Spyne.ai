// src/api/axios.js
import axios from 'axios';

function getTokenFromCookie() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('token=')) {
      return cookie.substring('token='.length);
    }
  }

  return null;
}

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to update token in cookie
api.interceptors.response.use(
  (response) => {
    // Update token in cookie if present in the response
    const { token } = response.data;
    if (token) {
      document.cookie = `token=${token}; path=/`;
    } 
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;


