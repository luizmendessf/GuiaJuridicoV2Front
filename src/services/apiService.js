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
  // Endpoints públicos que não precisam de autenticação
  const publicEndpoints = ['/oportunidades/todas', '/auth/login', '/auth/register'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url === endpoint || config.url.endsWith(endpoint));
  
  if (!isPublicEndpoint) {
    const token = localStorage.getItem('authToken');
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isTokenExpired(token)) {
      // Remove expired token from localStorage
      localStorage.removeItem('authToken');
    }
  }
  return config;
});

// --- Funções de Autenticação ---
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// --- Funções de Oportunidades ---
export const getAllOportunidades = () => api.get('/oportunidades/todas');
export const getOportunidades = (params) => api.get('/oportunidades', { params });
export const createOportunidade = (data) => api.post('/oportunidades', data);
export const updateOportunidade = (id, data) => api.put(`/oportunidades/${id}`, data);
export const deleteOportunidade = (id) => api.delete(`/oportunidades/${id}`);

// --- Funções de Usuário ---
export const getUserProfile = () => api.get('/usuarios/me');
export const updateUserProfile = (userData) => api.put('/usuarios/me', userData);
export const changePassword = (passwordData) => api.post('/usuarios/me/mudar-senha', passwordData);

// --- Funções de Administração ---
export const getAllUsers = () => api.get('/admin/usuarios');
export const deleteUser = (userId) => api.delete(`/admin/usuarios/${userId}`);
export const updateUserRoles = (userId, roles) => api.put(`/admin/usuarios/${userId}/roles`, { nomesDasRoles: roles });

// ... Outras funções (favoritar) virão aqui ...

export default api;