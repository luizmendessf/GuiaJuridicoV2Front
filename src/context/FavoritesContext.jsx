// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

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
      const response = await fetch('http://localhost:8080/api/usuarios/me/favoritos', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const savedOpportunities = await response.json();
        setFavorites(savedOpportunities);
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
      const response = await fetch(`http://localhost:8080/api/usuarios/me/favoritos/${opportunityId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Refresh favorites list
        await fetchFavorites();
        return true;
      } else {
        const errorText = await response.text();
        console.error('Error adding favorite:', response.status, errorText);
        alert(`Erro ${response.status}: ${errorText || 'Falha ao salvar oportunidade'}`);
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
      const response = await fetch(`http://localhost:8080/api/usuarios/me/favoritos/${opportunityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Refresh favorites list
        await fetchFavorites();
        return true;
      } else {
        const errorText = await response.text();
        console.error('Error removing favorite:', response.status, errorText);
        alert(`Erro ${response.status}: ${errorText || 'Falha ao remover oportunidade'}`);
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

export default FavoritesContext;