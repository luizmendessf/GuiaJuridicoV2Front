// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/apiService';
import { AuthContext } from './AuthContext';
import { opportunityImageMap } from '../utils/opportunityImageMap';
import { resolveOpportunityImageSrc } from '../utils/resolveOpportunityImageSrc';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch favorites from backend
  const fetchFavorites = async () => {
    if (!authToken) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/usuarios/me/favoritos', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.status === 200) {
        const savedOpportunities = response.data;
        // Process requirements field from JSON string to array and map images
        const processedOpportunities = savedOpportunities.map(opportunity => ({
          ...opportunity,
          image: resolveOpportunityImageSrc(
            opportunity.image,
            opportunityImageMap,
            api.defaults?.baseURL || ''
          ),
          requirements: opportunity.requirements ? JSON.parse(opportunity.requirements) : []
        }));
        setFavorites(processedOpportunities);
      } else {
        console.error('Error fetching favorites:', response.status);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if an opportunity is saved
  const isFavorite = (opportunityId) => {
    return favorites.some(fav => fav.id === opportunityId);
  };

  // Add opportunity to favorites
  const addFavorite = async (opportunityId) => {
    if (!authToken) {
      alert('Você precisa estar logado para salvar oportunidades');
      return false;
    }

    try {
      const response = await api.post(`/usuarios/me/favoritos/${opportunityId}`, null, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        // Refresh favorites list
        await fetchFavorites();
        return true;
      } else {
        console.error('Error adding favorite:', response.status, response.data);
        alert(`Erro ${response.status}: ${response.data || 'Falha ao salvar oportunidade'}`);
        return false;
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      alert('Erro de conexão: ' + error.message);
      return false;
    }
  };

  // Remove opportunity from favorites
  const removeFavorite = async (opportunityId) => {
    if (!authToken) {
      return false;
    }

    try {
      const response = await api.delete(`/usuarios/me/favoritos/${opportunityId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.status === 200 || response.status === 204) {
        // Refresh favorites list
        await fetchFavorites();
        return true;
      } else {
        console.error('Error removing favorite:', response.status, response.data);
        alert(`Erro ${response.status}: ${response.data || 'Falha ao remover oportunidade'}`);
        return false;
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Erro de conexão: ' + error.message);
      return false;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (opportunityId) => {
    const isCurrentlyFavorite = isFavorite(opportunityId);
    
    if (isCurrentlyFavorite) {
      return await removeFavorite(opportunityId);
    } else {
      return await addFavorite(opportunityId);
    }
  };

  // Load favorites when auth token changes
  useEffect(() => {
    fetchFavorites();
  }, [authToken]);

  // Listen for custom events to refresh favorites
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      fetchFavorites();
    };

    window.addEventListener('savedOpportunitiesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('savedOpportunitiesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const value = {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    fetchFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
