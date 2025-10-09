// src/pages/UserProfile.jsx
import React, { useState, useEffect, useContext } from 'react';
import { User, Heart, Bookmark, Edit } from 'lucide-react';
import OpportunityCard from '../components/cards/OpportunityCard';
import EditProfileModal from '../components/modals/EditProfileModal';
import { AuthContext } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { getUserProfile } from '../services/apiService';
import './UserProfile.css';

export default function UserProfile() {
  const [user, setUser] = useState({
    nome: 'Usuário',
    email: 'usuario@email.com'
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Testando ambos os contextos
  const { authToken } = useContext(AuthContext);
  const { favorites: savedOpportunities, loading: favoritesLoading } = useFavorites();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authToken) {
        try {
          const response = await getUserProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          // Fallback para dados do localStorage se a API falhar
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          if (userInfo.nome || userInfo.email) {
            setUser(userInfo);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authToken]);



  return (
    <div className="user-profile-page">
      <div className="container">
        {/* User Info Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.nome}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditModalOpen(true)}
            title="Editar perfil"
          >
            <Edit size={20} />
          </button>
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

          {favoritesLoading ? (
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
      
      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <p>Carregando perfil...</p>
        </div>
      )}
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(updatedUser) => {
          setUser(updatedUser);
          // Atualizar também no localStorage
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        }}
      />
    </div>
  );
}