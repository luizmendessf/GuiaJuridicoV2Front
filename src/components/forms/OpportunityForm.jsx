// src/components/forms/OpportunityForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Building, MapPin, DollarSign, ExternalLink, FileText, Tag, Image } from 'lucide-react';
import Button from '../ui/button';
import './OpportunityForm.css';

const OpportunityForm = ({ opportunity = null, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    applicationLink: '',
    type: 'Estágio',
    image: 'estagio.jpg',
    openingDate: '',
    closingDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const opportunityTypes = [
    'Estágio',
    'Vagas para Advogados',
    'Congresso',
    'Competição',
    'Publicação Acadêmica',
    'Eventos'
  ];

  const imageOptions = [
    { value: 'estagio.jpg', label: 'Estágio' },
    { value: 'advogado.jpg', label: 'Advogado' },
    { value: 'competicao.jpg', label: 'Competição' },
    { value: 'publicacao.jpg', label: 'Publicação' },
    { value: 'congresso.jpg', label: 'Congresso' },
    { value: 'eventos.jpg', label: 'Eventos' }
  ];

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        company: opportunity.company || '',
        location: opportunity.location || '',
        description: opportunity.description || '',
        requirements: (() => {
          if (!opportunity.requirements) return '';
          if (typeof opportunity.requirements === 'string') {
            try {
              const parsed = JSON.parse(opportunity.requirements);
              return Array.isArray(parsed) ? parsed.join('\n') : opportunity.requirements;
            } catch {
              return opportunity.requirements;
            }
          }
          return Array.isArray(opportunity.requirements) 
            ? opportunity.requirements.join('\n') 
            : opportunity.requirements;
        })(),
        salary: opportunity.salary || '',
        applicationLink: opportunity.applicationLink || '',
        type: opportunity.type || 'Estágio',
        image: opportunity.image || 'estagio.jpg',
        openingDate: opportunity.openingDate || '',
        closingDate: opportunity.closingDate || ''
      });
    }
  }, [opportunity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.company.trim()) newErrors.company = 'Empresa é obrigatória';
    if (!formData.location.trim()) newErrors.location = 'Localização é obrigatória';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.type) newErrors.type = 'Tipo é obrigatório';
    
    // Validate dates
    if (formData.openingDate && formData.closingDate) {
      if (new Date(formData.openingDate) >= new Date(formData.closingDate)) {
        newErrors.closingDate = 'Data de encerramento deve ser posterior à data de abertura';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        requirements: formData.requirements 
          ? JSON.stringify(formData.requirements.split('\n').filter(req => req.trim()))
          : JSON.stringify([])
      };
      
      await onSave(submitData);
    } catch (error) {
      console.error('Erro ao salvar oportunidade:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="opportunity-form-overlay">
      <div className="opportunity-form-modal">
        <div className="opportunity-form-header">
          <h2>
            {opportunity ? 'Editar Oportunidade' : 'Nova Oportunidade'}
          </h2>
          <button 
            type="button" 
            onClick={onCancel}
            className="close-button"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="opportunity-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">
                <FileText size={16} />
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Ex: Estágio em Direito Civil"
                disabled={loading}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="company">
                <Building size={16} />
                Empresa *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={errors.company ? 'error' : ''}
                placeholder="Ex: Escritório Silva & Associados"
                disabled={loading}
              />
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">
                <MapPin size={16} />
                Localização *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={errors.location ? 'error' : ''}
                placeholder="Ex: São Paulo, SP"
                disabled={loading}
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">
                <Tag size={16} />
                Tipo *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={errors.type ? 'error' : ''}
                disabled={loading}
              >
                {opportunityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="image">
                <Image size={16} />
                Imagem
              </label>
              <select
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                disabled={loading}
              >
                {imageOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="salary">
                <DollarSign size={16} />
                Remuneração
              </label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="Ex: R$ 1.500,00 ou Bolsa auxílio"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="openingDate">
                <Calendar size={16} />
                Data de Abertura
              </label>
              <input
                type="date"
                id="openingDate"
                name="openingDate"
                value={formData.openingDate}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="closingDate">
                <Calendar size={16} />
                Data de Encerramento
              </label>
              <input
                type="date"
                id="closingDate"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleInputChange}
                className={errors.closingDate ? 'error' : ''}
                disabled={loading}
              />
              {errors.closingDate && <span className="error-message">{errors.closingDate}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="applicationLink">
                <ExternalLink size={16} />
                Link de Inscrição
              </label>
              <input
                type="url"
                id="applicationLink"
                name="applicationLink"
                value={formData.applicationLink}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/inscricao"
                disabled={loading}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">
                <FileText size={16} />
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? 'error' : ''}
                placeholder="Descreva a oportunidade, responsabilidades, benefícios..."
                rows={4}
                disabled={loading}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="requirements">
                <FileText size={16} />
                Requisitos (um por linha)
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Cursando Direito\nConhecimento em Word e Excel\nDisponibilidade de 6 horas"
                rows={4}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (
                <>
                  <Save size={16} />
                  <span style={{ marginLeft: '0.5rem' }}>
                    {opportunity ? 'Atualizar' : 'Criar'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpportunityForm;