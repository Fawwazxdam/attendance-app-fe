import axios from 'axios';
import useSWR from 'swr';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service functions
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/logout');
    localStorage.removeItem('token');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Logout failed');
  }
};

// SWR fetcher
const fetcher = (url) => api.get(url).then((res) => res.data);

// Custom hook for authentication
export const useAuth = () => {
  const { data: user, error, mutate } = useSWR('/user', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('token', data.token);
    mutate(data.user); // Update user data
    return data;
  };

  const logout = async () => {
    await logoutUser();
    mutate(null); // Clear user data
  };

  return {
    user,
    isLoading: !error && !user,
    isError: error,
    login,
    logout,
  };
};