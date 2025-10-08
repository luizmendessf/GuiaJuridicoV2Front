// src/services/apiService.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Função para verificar se o token expirou
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Interceptador para adicionar o token JWT em todas as requisições autenticadas
api.interceptors.request.use(async config => {
  const token = localStorage.getItem('authToken');
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && isTokenExpired(token)) {
    // Remove expired token from localStorage
    localStorage.removeItem('authToken');
  }
  return config;
});

// --- Funções de Autenticação ---
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// --- Funções de Oportunidades ---
export const getOportunidades = (params) => api.get('/oportunidades', { params });

// ... Outras funções (criar, deletar, favoritar) virão aqui ...

export default api;