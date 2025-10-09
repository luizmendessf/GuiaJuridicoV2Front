// src/components/modals/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/button';
import { updateUserProfile, changePassword } from '../../services/apiService';
import './EditProfileModal.css';

const EditProfileModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    nome: '',
    celular: '',
    senhaAtual: '',
    senhaNova: '',
    confirmarSenha: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    senhaAtual: false,
    senhaNova: false,
    confirmarSenha: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        nome: user.nome || '',
        celular: user.celular || '',
        senhaAtual: '',
        senhaNova: '',
        confirmarSenha: ''
      });
      setErrors({});
      setIsChangingPassword(false);
    }
  }, [user, isOpen]);

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

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (isChangingPassword) {
      if (!formData.senhaAtual.trim()) {
        newErrors.senhaAtual = 'Senha atual é obrigatória';
      }
      
      if (!formData.senhaNova.trim()) {
        newErrors.senhaNova = 'Nova senha é obrigatória';
      } else if (formData.senhaNova.length < 6) {
        newErrors.senhaNova = 'Nova senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.senhaNova !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Confirmação de senha não confere';
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
      if (isChangingPassword) {
        // Atualizar dados e senha
        const updateData = {
          nome: formData.nome,
          celular: formData.celular,
          senhaAtual: formData.senhaAtual,
          senhaNova: formData.senhaNova
        };
        await updateUserProfile(updateData);
      } else {
        // Atualizar apenas dados pessoais
        const updateData = {
          nome: formData.nome,
          celular: formData.celular
        };
        await updateUserProfile(updateData);
      }
      
      // Chamar callback para atualizar os dados no componente pai
      onUpdate({
        ...user,
        nome: formData.nome,
        celular: formData.celular
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Erro ao atualizar perfil. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-profile-overlay">
      <div className="edit-profile-modal">
        <div className="edit-profile-header">
          <h2>Editar Perfil</h2>
          <button 
            type="button" 
            onClick={onClose}
            className="close-button"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-profile-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="nome">
              <User size={16} />
              Nome *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className={errors.nome ? 'error' : ''}
              placeholder="Seu nome completo"
              disabled={loading}
            />
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="celular">
              <Phone size={16} />
              Celular
            </label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleInputChange}
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email (não editável)
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="disabled-field"
            />
          </div>

          <div className="password-section">
            <div className="password-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={isChangingPassword}
                  onChange={(e) => setIsChangingPassword(e.target.checked)}
                  disabled={loading}
                />
                Alterar senha
              </label>
            </div>

            {isChangingPassword && (
              <>
                <div className="form-group">
                  <label htmlFor="senhaAtual">
                    <Lock size={16} />
                    Senha Atual *
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.senhaAtual ? 'text' : 'password'}
                      id="senhaAtual"
                      name="senhaAtual"
                      value={formData.senhaAtual}
                      onChange={handleInputChange}
                      className={errors.senhaAtual ? 'error' : ''}
                      placeholder="Digite sua senha atual"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('senhaAtual')}
                      disabled={loading}
                    >
                      {showPasswords.senhaAtual ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.senhaAtual && <span className="error-message">{errors.senhaAtual}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="senhaNova">
                    <Lock size={16} />
                    Nova Senha *
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.senhaNova ? 'text' : 'password'}
                      id="senhaNova"
                      name="senhaNova"
                      value={formData.senhaNova}
                      onChange={handleInputChange}
                      className={errors.senhaNova ? 'error' : ''}
                      placeholder="Digite a nova senha"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('senhaNova')}
                      disabled={loading}
                    >
                      {showPasswords.senhaNova ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.senhaNova && <span className="error-message">{errors.senhaNova}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmarSenha">
                    <Lock size={16} />
                    Confirmar Nova Senha *
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.confirmarSenha ? 'text' : 'password'}
                      id="confirmarSenha"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      className={errors.confirmarSenha ? 'error' : ''}
                      placeholder="Confirme a nova senha"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('confirmarSenha')}
                      disabled={loading}
                    >
                      {showPasswords.confirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
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
                    Salvar Alterações
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

export default EditProfileModal;