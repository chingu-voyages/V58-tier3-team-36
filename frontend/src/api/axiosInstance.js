import axios from 'axios';
import { getSession } from 'next-auth/react';

// Default API instance for list endpoints (serializes arrays without brackets)
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    paramsSerializer: {
      indexes: null, // This will serialize arrays as: countryCode=IN&countryCode=US
    }
});

// API instance for map/aggregate endpoints (serializes arrays with brackets)
export const apiMap = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    paramsSerializer: {
      indexes: false, // This will serialize arrays as: countryCode[]=IN&countryCode[]=US
    }
});

// Add request interceptor to attach backend JWT token
const authInterceptor = async (config) => {
  const session = await getSession();
  
  // Attach backend token if available
  if (session?.backendToken) {
    config.headers.Authorization = `Bearer ${session.backendToken}`;
  }
  
  return config;
};

const errorInterceptor = (error) => {
  return Promise.reject(error);
};

api.interceptors.request.use(authInterceptor, errorInterceptor);
apiMap.interceptors.request.use(authInterceptor, errorInterceptor);