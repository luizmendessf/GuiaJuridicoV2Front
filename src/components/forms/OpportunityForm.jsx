// src/components/forms/OpportunityForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Building, MapPin, DollarSign, ExternalLink, FileText, Tag, Image } from 'lucide-react';
import Button from '../ui/button';
import './OpportunityForm.css';
import { uploadImage } from '../../services/apiService';
import { opportunityPresetKeySet } from '../../utils/opportunityImageMap';
import { logicalImageKeyForForm, imageFilenameFromUploadResponse } from '../../utils/resolveOpportunityImageSrc';
import {
  CITY_CATALOG,
  LOCATION_MODALITIES,
  OTHER_CITY_VALUE,
  formatLocation,
  parseLocation,
} from '../../utils/locationUtils';

const emptyLocationFields = {
  locationModality: 'Presencial',
  locationCitySelect: '',
  locationCityOther: '',
};

const locationFieldsFromRaw = (raw) => {
  const parsed = parseLocation(raw);
  if (parsed.modality === 'Remoto' || parsed.kind === 'remoto') {
    return {
      locationModality: 'Remoto',
      locationCitySelect: '',
      locationCityOther: '',
    };
  }
  const cityKey = parsed.cityKey || '';
  const inCatalog = CITY_CATALOG.includes(cityKey);
  return {
    locationModality: parsed.modality === 'Híbrido' ? 'Híbrido' : 'Presencial',
    locationCitySelect: inCatalog ? cityKey : cityKey ? OTHER_CITY_VALUE : '',
    locationCityOther: inCatalog ? '' : cityKey,
  };
};

const OpportunityForm = ({ opportunity = null, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    salary: '',
    applicationLink: '',
    type: 'Estágio',
    image: 'estagio.jpg',
    openingDate: '',
    closingDate: '',
    ...emptyLocationFields,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
        image: logicalImageKeyForForm(opportunity.image, opportunityPresetKeySet),
        openingDate: opportunity.openingDate || '',
        closingDate: opportunity.closingDate || '',
        ...locationFieldsFromRaw(opportunity.location),
      });
    }
  }, [opportunity]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: value,
      };
      if (name === 'locationModality' && value === 'Remoto') {
        next.locationCitySelect = '';
        next.locationCityOther = '';
      }
      return next;
    });
    
    // Clear error when user starts typing
    const clearsLocationError = [
      'locationModality',
      'locationCitySelect',
      'locationCityOther',
    ].includes(name);
    if (errors[name] || (clearsLocationError && errors.location)) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        ...(clearsLocationError ? { location: '' } : {}),
      }));
    }
  };

  const resolveCityKey = () => {
    if (formData.locationModality === 'Remoto') return null;
    if (formData.locationCitySelect === OTHER_CITY_VALUE) {
      return formData.locationCityOther.trim();
    }
    return formData.locationCitySelect.trim();
  };

  const buildLocationString = () =>
    formatLocation({
      modality: formData.locationModality,
      cityKey: resolveCityKey(),
    });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.company.trim()) newErrors.company = 'Empresa é obrigatória';
    if (!formData.locationModality) {
      newErrors.location = 'Modalidade é obrigatória';
    } else if (formData.locationModality !== 'Remoto') {
      const cityKey = resolveCityKey();
      if (!cityKey) {
        newErrors.location = 'Cidade é obrigatória';
      } else if (
        formData.locationCitySelect === OTHER_CITY_VALUE &&
        !formData.locationCityOther.trim()
      ) {
        newErrors.location = 'Informe a cidade';
      }
    }
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
      const {
        locationModality,
        locationCitySelect,
        locationCityOther,
        ...rest
      } = formData;
      const submitData = {
        ...rest,
        location: buildLocationString(),
        requirements: formData.requirements 
          ? JSON.stringify(formData.requirements.split('\n').filter(req => req.trim()))
          : JSON.stringify([])
      };
      // Se houver arquivo de imagem selecionado, faz upload antes de salvar
      if (imageFile) {
        try {
          const response = await uploadImage(imageFile);
          const d = response.data;
          const nameFromApi = d?.filename;
          const fromUrl =
            imageFilenameFromUploadResponse(d?.url || '') ||
            (typeof d === 'string' ? imageFilenameFromUploadResponse(d) : null);
          const storedName = nameFromApi || fromUrl;
          if (!storedName) {
            setErrors((prev) => ({
              ...prev,
              image: 'Upload concluído mas o servidor não devolveu o nome do ficheiro. Tente outra imagem.',
            }));
            return;
          }
          submitData.image = storedName;
        } catch (err) {
          console.error('Falha no upload da imagem:', err);
          setErrors((prev) => ({ ...prev, image: 'Falha ao enviar imagem. Tente novamente.' }));
          return;
        }
      }

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

            <div className="form-group full-width location-fields">
              <label>
                <MapPin size={16} />
                Localização *
              </label>
              <div className="location-fields__row">
                <div className="location-fields__modality">
                  <span className="location-fields__sublabel">Modalidade</span>
                  <select
                    id="locationModality"
                    name="locationModality"
                    value={formData.locationModality}
                    onChange={handleInputChange}
                    className={errors.location ? 'error' : ''}
                    disabled={loading}
                    aria-label="Modalidade da localização"
                  >
                    {LOCATION_MODALITIES.map((modality) => (
                      <option key={modality} value={modality}>{modality}</option>
                    ))}
                  </select>
                </div>
                <div className="location-fields__city">
                  <span className="location-fields__sublabel">Cidade</span>
                  <select
                    id="locationCitySelect"
                    name="locationCitySelect"
                    value={
                      formData.locationModality === 'Remoto'
                        ? ''
                        : formData.locationCitySelect
                    }
                    onChange={handleInputChange}
                    className={errors.location ? 'error' : ''}
                    disabled={loading || formData.locationModality === 'Remoto'}
                    aria-label="Cidade da localização"
                  >
                    <option value="">
                      {formData.locationModality === 'Remoto'
                        ? 'Não se aplica (remoto)'
                        : 'Selecione a cidade'}
                    </option>
                    {CITY_CATALOG.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                    <option value={OTHER_CITY_VALUE}>Outra…</option>
                  </select>
                  {formData.locationModality !== 'Remoto' &&
                    formData.locationCitySelect === OTHER_CITY_VALUE && (
                      <input
                        type="text"
                        id="locationCityOther"
                        name="locationCityOther"
                        value={formData.locationCityOther}
                        onChange={handleInputChange}
                        className={errors.location ? 'error' : ''}
                        placeholder="Ex: Curitiba, PR"
                        disabled={loading}
                        style={{ marginTop: '0.5rem' }}
                      />
                    )}
                </div>
              </div>
              <p className="location-fields__preview">
                Será salvo como: <strong>{buildLocationString() || '—'}</strong>
              </p>
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
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <div className="image-preview">
                  {previewUrl || (formData.image && (formData.image.startsWith('http') || formData.image.startsWith('/')) ) ? (
                    <img src={previewUrl || formData.image} alt="Pré-visualização" />
                  ) : (
                    <div className="image-preview__placeholder">Sem imagem selecionada</div>
                  )}
                </div>
                {errors.image && <span className="error-message">{errors.image}</span>}
              </div>
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