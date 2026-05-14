// src/services/apiService.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const defaultBaseURL = import.meta.env?.DEV
  ? 'http://localhost:8080/api'
  : 'https://guiajuridicov2back.onrender.com/api';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || defaultBaseURL
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
// Endpoints públicos (sem enviar JWT). GET da biblioteca NÃO entra aqui: enviamos token se existir,
// para compatibilidade com proxies e o backend continua permitindo acesso anônimo (permitAll).
api.interceptors.request.use(async config => {
  const rawUrl = config.url || '';
  const pathOnly = rawUrl.includes('?') ? rawUrl.split('?')[0] : rawUrl;
  const url = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  const method = (config.method || 'get').toLowerCase();
  const isAuthPublic = url.startsWith('/auth/login') || url.startsWith('/auth/register');
  const isPublicBlogGet =
    method === 'get' &&
    (url === '/blog' || (url.startsWith('/blog/') && !url.startsWith('/blog/admin')));
  const isPublicPdfGet = method === 'get' && url.startsWith('/pdfs/');
  const isPublicGet =
    method === 'get' &&
    (url.startsWith('/oportunidades/todas') || isPublicBlogGet || isPublicPdfGet);
  const isPublicNewsletter =
    url.startsWith('/public/newsletter/') &&
    (method === 'post' || method === 'get');
  const isPublicEndpoint = isAuthPublic || isPublicGet || isPublicNewsletter;
  
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

// --- Imagens ---
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadLibraryPdf = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/pdfs/upload', formData);
};

// --- Oportunidade por ID ---
export const getOportunidadeById = (id) => api.get(`/oportunidades/${id}`);

// --- Funções de Usuário ---
export const getUserProfile = () => api.get('/usuarios/me');
export const updateUserProfile = (userData) => api.put('/usuarios/me', userData);
export const changePassword = (passwordData) => api.post('/usuarios/me/mudar-senha', passwordData);

// --- Funções de Administração ---
export const getAllUsers = () => api.get('/admin/usuarios');
export const deleteUser = (userId) => api.delete(`/admin/usuarios/${userId}`);
export const updateUserRoles = (userId, roles) => api.put(`/admin/usuarios/${userId}/roles`, { nomesDasRoles: roles });

// --- Funções de Blog ---
export const getBlogArticles = () => api.get('/blog');
export const getBlogArticleByIdOrSlug = (idOrSlug) => api.get(`/blog/${idOrSlug}`);
export const createBlogArticle = (data) => api.post('/blog', data);
export const getBlogArticlesAdmin = () => api.get('/blog/admin');
export const getBlogArticleAdminById = (id) => api.get(`/blog/admin/${id}`);
export const updateBlogArticle = (id, data) => api.put(`/blog/${id}`, data);
export const deleteBlogArticle = (id) => api.delete(`/blog/${id}`);

// --- Biblioteca (PDFs no disco do servidor) ---
export const getLibraryDocuments = () => api.get('/biblioteca');
export const getLibraryDocumentByIdOrSlug = (idOrSlug) => api.get(`/biblioteca/${idOrSlug}`);
export const createLibraryDocument = (data) => api.post('/biblioteca', data);
export const getLibraryDocumentsAdmin = () => api.get('/biblioteca/admin');
export const getLibraryDocumentAdminById = (id) => api.get(`/biblioteca/admin/${id}`);
export const updateLibraryDocument = (id, data) => api.put(`/biblioteca/${id}`, data);
export const deleteLibraryDocument = (id) => api.delete(`/biblioteca/${id}`);

// --- Newsletter (público) ---
export const subscribeNewsletter = (data) => api.post('/public/newsletter/subscribe', data);
export const unsubscribeNewsletter = (data) => api.post('/public/newsletter/unsubscribe', data);

// ... Outras funções (favoritar) virão aqui ...

export default api;
