import axios from 'axios';

// Якщо VITE_API_URL починається з /, використовуємо відносний шлях (для nginx proxy)
// Інакше використовуємо повний URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL.startsWith('/') ? API_URL : API_URL,
  withCredentials: true, // Для сесій
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для обробки помилок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Перенаправити на логін якщо не авторизовано
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
