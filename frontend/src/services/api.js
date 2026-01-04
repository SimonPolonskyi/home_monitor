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

// Interceptor для обробки запитів (додати cookies)
api.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.url);
    console.log('Request cookies:', document.cookie);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обробки відповідей
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    console.log('Response data:', response.data);
    console.log('Response headers:', response.headers);
    console.log('Set-Cookie header:', response.headers['set-cookie']);
    console.log('Cookies after response:', document.cookie);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    console.error('Error response:', error.response);
    
    if (error.response?.status === 401) {
      // Не перенаправляти якщо вже на сторінці логіну або це запит перевірки автентифікації
      const isLoginPage = window.location.pathname === '/login';
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      
      if (!isLoginPage && !isAuthCheck) {
        // Перенаправити на логін якщо не авторизовано
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
