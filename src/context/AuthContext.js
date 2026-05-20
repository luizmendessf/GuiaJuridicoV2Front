// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { loginWithGoogle as loginWithGoogleApi } from '../services/apiService';
import { jwtDecode } from "jwt-decode"; // Instale com: npm install jwt-decode

const AuthContext = createContext(null);

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const currentApiBaseURL = api?.defaults?.baseURL || '';
    const previousApiBaseURL = localStorage.getItem('apiBaseURL') || '';
    if (previousApiBaseURL && currentApiBaseURL && previousApiBaseURL !== currentApiBaseURL) {
      localStorage.removeItem('authToken');
      setUser(null);
    }
    if (currentApiBaseURL) {
      localStorage.setItem('apiBaseURL', currentApiBaseURL);
    }

    const token = localStorage.getItem('authToken');
    if (token && !isTokenExpired(token)) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        localStorage.removeItem('authToken');
      }
    } else if (token && isTokenExpired(token)) {
      // Token expirado, remove do localStorage
      localStorage.removeItem('authToken');
    }
    setLoading(false);
  }, []);

  const persistToken = (token) => {
    if (!token) {
      throw new Error('Token não recebido do servidor');
    }
    localStorage.setItem('authToken', token);
    setUser(jwtDecode(token));
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      persistToken(response.data?.token);
      return response;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await loginWithGoogleApi(credential);
      persistToken(response.data?.token);
      return response;
    } catch (error) {
      console.error('Erro no login com Google:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Get valid token (null if expired)
  const getValidToken = () => {
    const token = localStorage.getItem('authToken');
    if (token && !isTokenExpired(token)) {
      return token;
    }
    return null;
  };

  // Função para verificar se o usuário tem permissões de admin ou organizador
  const hasAdminOrOrganizerRole = () => {
    if (!user || !user.authorities) return false;
    return user.authorities.some(auth => 
      auth === 'ROLE_ADMIN' || auth === 'ROLE_ORGANIZADOR'
    );
  };

  // Função para verificar se o usuário é especificamente admin
  const hasAdminRole = () => {
    if (!user || !user.authorities) return false;
    return user.authorities.some(auth => auth === 'ROLE_ADMIN');
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    authToken: getValidToken(),
    hasAdminOrOrganizerRole,
    hasAdminRole
  };

  if (loading) {
    return React.createElement('div', {
      style: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--color-primary-600)'
      }
    }, 'Carregando...');
  }

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
