// src/pages/OpportunityEditorPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OpportunityForm from '../components/forms/OpportunityForm';
import { getOportunidadeById, createOportunidade, updateOportunidade } from '../services/apiService';

export default function OpportunityEditorPage({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (mode === 'edit' && id) {
        setLoading(true);
        try {
          const response = await getOportunidadeById(id);
          const data = response.data;
          setOpportunity(data);
        } catch (err) {
          console.error('Erro ao buscar oportunidade:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOpportunity();
  }, [mode, id]);

  const handleSave = async (formData) => {
    try {
      if (mode === 'edit' && id) {
        await updateOportunidade(id, formData);
      } else {
        await createOportunidade(formData);
      }
      navigate('/oportunidades');
    } catch (error) {
      console.error('Erro ao salvar oportunidade:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/oportunidades');
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <OpportunityForm
          opportunity={opportunity}
          onSave={handleSave}
          onCancel={handleCancel}
          isOpen={true}
        />
      )}
    </div>
  );
}