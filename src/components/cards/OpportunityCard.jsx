// src/components/cards/OpportunityCard.jsx
import { Clock, Building, MapPin, ExternalLink, Heart, Edit, Trash2 } from "lucide-react";
import Button from "../ui/button";
import { useState } from "react";
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import "./OpportunityCard.css";

export default function OpportunityCard({ opportunity, onEdit, onDelete }) {
  const {
    id,
    image,
    type,
    closingDate,
    title,
    company,
    location,
    description,
    requirements,
    salary,
    applicationLink,
    status,
  } = opportunity;

  const { isFavorite, toggleFavorite } = useFavorites();
  const { hasAdminOrOrganizerRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isSaved = isFavorite(id);
  const canEdit = hasAdminOrOrganizerRole();

  const getStatusText = (status) => {
    if (status === 'Abertas') return 'Inscrições Abertas';
    if (status === 'Em Breve') return 'Abre em Breve';
    return 'Inscrições Encerradas';
  };

  const handleSaveToggle = async () => {
    setIsLoading(true);
    
    try {
      await toggleFavorite(id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(opportunity);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta oportunidade?')) {
      setIsDeleting(true);
      try {
        if (onDelete) {
          await onDelete(id);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`card opportunity-card status-border--${status}`}>
      <div className="opportunity-card__header">
        <div className="opportunity-card__image-wrapper">
          <img src={image || "/placeholder.svg"} alt={title} className="opportunity-card__image" />
          <div className="card-actions">
            <button 
              className={`heart-button ${isSaved ? 'saved' : ''}`}
              onClick={handleSaveToggle}
              disabled={isLoading}
              aria-label={isSaved ? 'Remover dos salvos' : 'Salvar oportunidade'}
            >
              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
            {canEdit && (
              <>
                <button 
                  className="edit-button"
                  onClick={handleEdit}
                  aria-label="Editar oportunidade"
                  title="Editar oportunidade"
                >
                  <Edit size={18} />
                </button>
                <button 
                  className="delete-button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Excluir oportunidade"
                  title="Excluir oportunidade"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="opportunity-card__info-bar">
          <span className="badge" data-type={type}>{type}</span>
          <div className={`status-indicator status--${status}`}>
            {getStatusText(status)}
          </div>
        </div>
        <h3 className="opportunity-card__title">{title}</h3>
        <p className="opportunity-card__meta">
          <Building size={16} /> {company}
        </p>
        <p className="opportunity-card__meta">
          <MapPin size={16} /> {location}
        </p>
      </div>
      
      <div className="card__content">
        <p className="opportunity-card__description">{description}</p>
        
        {requirements && requirements.length > 0 && (
          <div className="opportunity-card__requirements">
            <h4>Requisitos:</h4>
            <ul>
              {requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* ### INÍCIO DA CORREÇÃO ### */}
      <div className="opportunity-card__footer">
        <div className="footer__details">
          {salary && salary !== "N/A" && (
            <div className="salary">
              <span>Remuneração:</span>
              <p>{salary}</p>
            </div>
          )}

          {/* Renderiza a data APENAS se ela existir E NÃO FOR a data futura */}
          {closingDate && closingDate !== '2099-12-31' && (
            <div className="deadline">
              <Clock size={16} />
              <span>
                {status === 'Encerradas' ? 'Encerrado em: ' : 'Encerra em: '}
                {new Date(closingDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </span>
            </div>
          )}
        </div>
        
        {applicationLink && status === 'Abertas' && (
          <div className="footer__action">
            <Button href={applicationLink} variant="primary">
              Candidatar-se <ExternalLink size={16} />
            </Button>
          </div>
        )}
      </div>
      {}
    </div>
  );
}