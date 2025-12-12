import axios from 'axios';
import { getSession } from 'next-auth/react';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Add request interceptor to attach backend JWT token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    
    // Attach backend token if available
    if (session?.backendToken) {
      config.headers.Authorization = `Bearer ${session.backendToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);