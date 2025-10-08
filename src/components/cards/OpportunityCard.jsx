// src/components/cards/OpportunityCard.jsx
import { Clock, Building, MapPin, ExternalLink, Heart } from "lucide-react";
import Button from "../ui/button";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../context/AuthContext';
import "./OpportunityCard.css";

export default function OpportunityCard({ opportunity }) {
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

  const { authToken } = useContext(AuthContext);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved state from backend on component mount
  useEffect(() => {
    if (authToken) {
      checkIfSaved();
    }
  }, [id, authToken]);

  // Function to check if opportunity is saved
  const checkIfSaved = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/usuarios/me/favoritos', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const savedOpportunities = await response.json();
        setIsSaved(savedOpportunities.some(opp => opp.id === id));
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const getStatusText = (status) => {
    if (status === 'Abertas') return 'Inscrições Abertas';
    if (status === 'Em Breve') return 'Abre em Breve';
    return 'Inscrições Encerradas';
  };

  const handleSaveToggle = async () => {
    if (!authToken) {
      alert('Você precisa estar logado para salvar oportunidades');
      return;
    }

    setIsLoading(true);
    
    try {
      const url = `http://localhost:8080/api/usuarios/me/favoritos/${id}`;
      const method = isSaved ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setIsSaved(!isSaved);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('savedOpportunitiesUpdated'));
      } else {
        console.error('Error saving/unsaving opportunity');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`card opportunity-card status-border--${status}`}>
      <div className="opportunity-card__header">
        <div className="opportunity-card__image-wrapper">
          <img src={image || "/placeholder.svg"} alt={title} className="opportunity-card__image" />
          <button 
            className={`heart-button ${isSaved ? 'saved' : ''}`}
            onClick={handleSaveToggle}
            disabled={isLoading}
            aria-label={isSaved ? 'Remover dos salvos' : 'Salvar oportunidade'}
          >
            <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
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