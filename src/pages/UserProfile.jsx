// src/pages/UserProfile.jsx
import React, { useState, useEffect, useContext } from 'react';
import { User, Heart, Bookmark } from 'lucide-react';
import OpportunityCard from '../components/cards/OpportunityCard';
import { AuthContext } from '../context/AuthContext';
import './UserProfile.css';

export default function UserProfile() {
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: 'Usuário',
    email: 'usuario@email.com'
  });
  const { authToken } = useContext(AuthContext);

  // Load saved opportunities from backend
  const loadSavedOpportunities = async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/me/favoritos', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const saved = await response.json();
        setSavedOpportunities(saved);
      } else {
        console.error('Error loading saved opportunities');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedOpportunities();
    
    // Get user info from localStorage or context
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo.name || userInfo.email) {
      setUser(userInfo);
    }
  }, [authToken]);

  // Listen for changes in saved opportunities
  useEffect(() => {
    const handleCustomEvent = () => {
      loadSavedOpportunities();
    };
    
    window.addEventListener('savedOpportunitiesUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('savedOpportunitiesUpdated', handleCustomEvent);
    };
  }, []);

  return (
    <div className="user-profile-page">
      <div className="container">
        {/* User Info Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {/* Saved Opportunities Section */}
        <div className="saved-opportunities-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <Heart className="section-icon" size={24} />
              <h2 className="section-title">Oportunidades Salvas</h2>
            </div>
            <div className="opportunities-count">
              <Bookmark size={20} />
              <span>{savedOpportunities.length} oportunidade{savedOpportunities.length !== 1 ? 's' : ''} salva{savedOpportunities.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Carregando oportunidades salvas...</p>
            </div>
          ) : savedOpportunities.length > 0 ? (
            <div className="saved-opportunities-grid">
              {savedOpportunities.map((opportunity) => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity} 
                />
              ))}
            </div>
          ) : (
            <div className="no-saved-opportunities">
              <Heart size={64} className="empty-heart" />
              <h3>Nenhuma oportunidade salva ainda</h3>
              <p>
                Explore as <a href="/oportunidades" className="link">oportunidades disponíveis</a> e 
                clique no coração para salvá-las aqui!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}