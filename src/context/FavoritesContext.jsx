// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/apiService';
import { AuthContext } from './AuthContext';

// Import images for mapping
import competicao from '../assets/imagens/competicao.jpeg';
import artigo from '../assets/imagens/artigo.jpg';
import estagio from '../assets/imagens/estagio.jpg';
import advogado from '../assets/imagens/advogado.jpg';
import congresso from '../assets/imagens/congresso.jpg';

// Specific images
import direitosHumanos from '../assets/imagens/congresso-direitoshumanos.png';
import cienciasCriminais from '../assets/imagens/seminario-cienciaqs-contabeis.png';
import ibdfam from '../assets/imagens/ibdfam.jpg';
import fenalaw from '../assets/imagens/fenalaw.png';
import intCivil from '../assets/imagens/congressoIntDireitoCivil.jpg';
import consinter from '../assets/imagens/consinter.jpg';
import emerj from '../assets/imagens/emerj.png';
import inbetta from '../assets/imagens/inbetta.jpg';
import lennonfelix from '../assets/imagens/lennonfelix.png';
import wwf from '../assets/imagens/wwf.jpg';
import lbca from '../assets/imagens/lbca.png';
import emais from '../assets/imagens/emais.png';
import canonical from '../assets/imagens/canonical.jpg';
import urbano from '../assets/imagens/urbano.png';
import vianna from '../assets/imagens/vianna.png';
import qca from '../assets/imagens/qca.png';
import machadomeyer from '../assets/imagens/machadomeyer.jpg';
import zurano from '../assets/imagens/zurano.jpg';
import radar from '../assets/imagens/radar.png';
import mendes from '../assets/imagens/mendes.jpg';
import contabilizei from '../assets/imagens/contabilizei.jpg';
import persona from '../assets/imagens/persona.jpg';
import ibd from '../assets/imagens/ibd.png';
import experience from '../assets/imagens/experience.jpg';
import stf from '../assets/imagens/stf.jpg';
import vis from '../assets/imagens/vis.jpg';
import jessup from '../assets/imagens/jessup.jpg';
import direitoepraxis from '../assets/imagens/direitoepraxis.png';
import cientifica from '../assets/imagens/cientifica.jpg';
import rdb from '../assets/imagens/rdb.jpg';
import ufv from '../assets/imagens/ufv.jpg';
import rbdu from '../assets/imagens/rbdu.png';
import rej from '../assets/imagens/rej.png';
import idp from '../assets/imagens/idp.jpg';

// Image mapping object
const imageMap = {
  // Default images
  "competicao.jpg": competicao,
  "publicacao.jpg": artigo,
  "estagio.jpg": estagio,
  "advogado.jpg": advogado,
  "congresso.jpg": congresso,
  
  // Specific images
  "direitos-humanos.png": direitosHumanos,
  "cienciasCriminais.png": cienciasCriminais,
  "ibdfam.jpg": ibdfam,
  "fenalaw.png": fenalaw,
  "consinter.jpg": consinter,
  "intCivil.jpg": intCivil,
  "emerj.png": emerj,
  "inbetta.jpg": inbetta,
  "lennonfelix.jpg": lennonfelix,
  "wwf.jpg": wwf,
  "lbca.png": lbca,
  "emais.png": emais,
  "canonical.jpg": canonical,
  "urbano.png": urbano,
  "vianna.png": vianna,
  "qca.png": qca,
  "machadomeyer.jpg": machadomeyer,
  "zurano.jpg": zurano,
  "radar.png": radar,
  "mendes.jpg": mendes,
  "contabilizei.jpg": contabilizei,
  "persona.jpg": persona,
  "ibd.png": ibd,
  "experience.jpg": experience,
  "stf.jpg": stf,
  "vis.jpg": vis,
  "jessup.jpg": jessup,
  "direitoepraxis.png": direitoepraxis,
  "cientifica.jpg": cientifica,
  "rdb.jpg": rdb,
  "ufv.jpg": ufv,
  "rbdu.png": rbdu,
  "rej.png": rej,
  "idp.jpg": idp,
};

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
          image: imageMap[opportunity.image] || imageMap['estagio.jpg'], // fallback image
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

export default FavoritesContext;